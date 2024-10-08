import React, { useState, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import { useConfig } from "../providers/config-account-provider";
import { useCollateral } from "../providers/collateral-account-provider";
import { usePythPrice } from "../providers/pyth-pricefeed-provider";
import { calculateHealthFactor, BASE_UNIT } from "@/app/utils";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { program } from "@/anchor/setup";
import { BN } from "@coral-xyz/anchor";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { Loader2 } from "lucide-react";
import { useTransactionToast } from "./toast";

// UI to invoke redeemCollateralAndBurnTokens instruction
const RedeemBurnUI = () => {
  const [burnAmount, setBurnAmount] = useState(0);
  const [redeemAmount, setRedeemAmount] = useState(0);
  const [maxRedeemAmount, setMaxRedeemAmount] = useState(0);
  const [healthFactor, setHealthFactor] = useState(0);
  const [error, setError] = useState("");
  const [isMaxRedeem, setIsMaxRedeem] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { config } = useConfig();
  const { collateral, collateralAccountPDA } = useCollateral();
  const { solPriceFeed, solUsdPriceFeedAccount } = usePythPrice();
  const { connection } = useConnection();
  const { publicKey, connected, sendTransaction } = useWallet();
  const { showTransactionToast } = useTransactionToast();

  const updateCalculations = useCallback(() => {
    if (solPriceFeed && config && collateral) {
      const remainingMinted = Math.max(collateral.amountMinted - burnAmount, 0);
      const maxRedeemLamports = collateral.lamportBalance;

      setMaxRedeemAmount(maxRedeemLamports);

      if (isMaxRedeem) {
        setRedeemAmount(maxRedeemLamports);
      }

      if (remainingMinted === 0) {
        setHealthFactor(Number.POSITIVE_INFINITY);
      } else {
        const newHealthFactor = calculateHealthFactor(
          collateral.lamportBalance - redeemAmount,
          remainingMinted,
          config.liquidationThreshold,
          solPriceFeed,
        );
        setHealthFactor(newHealthFactor);

        if (newHealthFactor < config.minHealthFactor && !isMaxRedeem) {
          setError("Warning: Health factor would be below minimum");
        } else {
          setError("");
        }
      }
    }
  }, [solPriceFeed, config, collateral, burnAmount, redeemAmount, isMaxRedeem]);

  useEffect(() => {
    updateCalculations();
  }, [updateCalculations]);

  const handleBurnAmountChange = (value: number) => {
    const burnAmountInBaseUnits = Math.floor(value * BASE_UNIT);
    setBurnAmount(burnAmountInBaseUnits);
    updateCalculations();
  };

  const handleRedeemAmountChange = (value: number) => {
    setRedeemAmount(value);
    updateCalculations();
  };

  const handleMaxRedeemToggle = (checked: boolean) => {
    setIsMaxRedeem(checked);
    if (checked) {
      setRedeemAmount(maxRedeemAmount);
      setBurnAmount(collateral?.amountMinted);
    }
  };

  const resetAmounts = () => {
    setRedeemAmount(0);
    setBurnAmount(0);
  };

  const handleRedeemAndBurn = async () => {
    if (!publicKey || !solPriceFeed || !collateralAccountPDA) {
      setError(
        "Wallet not connected, price feed unavailable, or collateral account not found",
      );
      return;
    }
    setIsLoading(true);

    try {
      const amountCollateral = new BN(redeemAmount);
      const amountToBurn = new BN(burnAmount);

      const tx = await program.methods
        .redeemCollateralAndBurnTokens(amountCollateral, amountToBurn)
        .accounts({
          depositor: publicKey,
          priceUpdate: solUsdPriceFeedAccount,
        })
        .transaction();

      const transactionSignature = await sendTransaction(tx, connection, {
        skipPreflight: true,
      });
      console.log("Transaction signature", transactionSignature);
      showTransactionToast(transactionSignature);
      resetAmounts();
    } catch (err) {
      console.error("Error redeeming collateral and burning tokens:", err);
      //   setError("Failed to redeem collateral and burn tokens");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid w-full items-center gap-4">
      <div className="flex flex-col space-y-1.5">
        <Label htmlFor="burnAmount">Burn Amount ($)</Label>
        <Input
          id="burnAmount"
          type="number"
          value={burnAmount / BASE_UNIT}
          onChange={(e) =>
            handleBurnAmountChange(parseFloat(e.target.value) || 0)
          }
          max={(collateral?.amountMinted || 0) / BASE_UNIT}
          //   step="0.000000001"
        />
      </div>
      <div className="flex flex-col space-y-1.5">
        <Label htmlFor="redeemAmount">Redeem Amount (SOL)</Label>
        <Slider
          id="redeemAmount"
          max={maxRedeemAmount}
          step={LAMPORTS_PER_SOL / 1e6}
          value={[redeemAmount]}
          onValueChange={(value) => handleRedeemAmountChange(value[0])}
          disabled={isMaxRedeem}
        />
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            {(redeemAmount / LAMPORTS_PER_SOL).toFixed(3)} /
            {(maxRedeemAmount / LAMPORTS_PER_SOL).toFixed(3)} SOL
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="maxRedeem"
              checked={isMaxRedeem}
              onCheckedChange={handleMaxRedeemToggle}
            />
            <Label htmlFor="maxRedeem">Max</Label>
          </div>
        </div>
      </div>
      <div className="flex flex-col space-y-1.5">
        <Label>Health Factor</Label>
        <progress
          value={healthFactor}
          max={config?.minHealthFactor * 2 || 200}
          className="w-full"
        ></progress>
        <div className="text-sm text-muted-foreground">
          {healthFactor === Number.POSITIVE_INFINITY
            ? "N/A (All tokens burned)"
            : healthFactor.toFixed(2)}
        </div>
      </div>
      <Button
        onClick={handleRedeemAndBurn}
        disabled={!connected || !!error || isLoading}
      >
        {isLoading ? (
          <Loader2 className="h-6 w-6 animate-spin" />
        ) : (
          "Redeem and Burn"
        )}
      </Button>
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default RedeemBurnUI;
