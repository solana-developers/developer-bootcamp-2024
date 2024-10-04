import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { AlertCircle, Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import { useConfig } from "../providers/config-account-provider";
import { usePythPrice } from "../providers/pyth-pricefeed-provider";
import {
  calculateHealthFactor,
  getLamportsFromUsd,
  BASE_UNIT,
} from "@/app/utils";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { program } from "@/anchor/setup";
import { BN } from "@coral-xyz/anchor";
import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { useCollateral } from "../providers/collateral-account-provider";
import { useTransactionToast } from "./toast";

interface SelectedAccount {
  pubkey: PublicKey;
  lamportBalanceInSol: number;
  amountMintedInUsd: number;
  healthFactor: number;
}

interface LiquidateUIProps {
  selectedAccount: SelectedAccount;
}

// UI to invoke liquidate instruction
const LiquidateUI: React.FC<LiquidateUIProps> = ({ selectedAccount }) => {
  const [liquidateAmount, setLiquidateAmount] = useState(0);
  const [maxLiquidateAmount, setMaxLiquidateAmount] = useState(0);
  const [isMaxLiquidate, setIsMaxLiquidate] = useState(false);
  const [solToReceive, setSolToReceive] = useState(0);
  const [liquidationBonus, setLiquidationBonus] = useState(0);
  const [remainingMinted, setRemainingMinted] = useState(0);
  const [healthFactor, setHealthFactor] = useState(0);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { config } = useConfig();
  const { refetchCollateralAccount } = useCollateral();
  const { solPriceFeed, solUsdPriceFeedAccount } = usePythPrice();
  const { connection } = useConnection();
  const { publicKey, connected, sendTransaction } = useWallet();
  const { showTransactionToast } = useTransactionToast();

  const updateCalculations = useCallback(() => {
    if (solPriceFeed && config && selectedAccount) {
      const effectiveLiquidateAmount = isMaxLiquidate
        ? selectedAccount.amountMintedInUsd * BASE_UNIT
        : liquidateAmount;

      const lamports = getLamportsFromUsd(
        effectiveLiquidateAmount / BASE_UNIT,
        solPriceFeed,
      );
      const bonus = (lamports * Number(config.liquidationBonus)) / 100;
      const totalSolToReceive = lamports + bonus;

      setSolToReceive(totalSolToReceive);
      setLiquidationBonus(bonus);

      const remainingMinted = Math.max(
        selectedAccount.amountMintedInUsd * BASE_UNIT -
          effectiveLiquidateAmount,
        0,
      );
      setRemainingMinted(remainingMinted);
      const remainingCollateral =
        selectedAccount.lamportBalanceInSol * LAMPORTS_PER_SOL -
        totalSolToReceive;

      const newHealthFactor = calculateHealthFactor(
        remainingCollateral,
        remainingMinted,
        config.liquidationThreshold,
        solPriceFeed,
      );
      setHealthFactor(newHealthFactor);

      setMaxLiquidateAmount(selectedAccount.amountMintedInUsd * BASE_UNIT);

      console.log(newHealthFactor);
    }
  }, [solPriceFeed, config, selectedAccount, liquidateAmount, isMaxLiquidate]);

  useEffect(() => {
    updateCalculations();
  }, [updateCalculations]);

  const handleLiquidateAmountChange = (value: number[]) => {
    setLiquidateAmount(value[0]);
    updateCalculations();
  };

  const handleMaxLiquidateToggle = (checked: boolean) => {
    setIsMaxLiquidate(checked);
    if (checked) {
      setLiquidateAmount(maxLiquidateAmount);
    }
    updateCalculations();
  };

  const resetAmounts = () => {
    setLiquidateAmount(0);
    setIsMaxLiquidate(false);
    updateCalculations();
  };

  const handleLiquidate = async () => {
    if (!publicKey || !solPriceFeed) {
      setError("Wallet not connected or price feed unavailable");
      return;
    }
    setIsLoading(true);

    try {
      const amountToBurn = new BN(liquidateAmount);

      const tx = await program.methods
        .liquidate(amountToBurn)
        .accounts({
          liquidator: publicKey,
          collateralAccount: selectedAccount.pubkey,
          priceUpdate: solUsdPriceFeedAccount,
        })
        .transaction();

      const transactionSignature = await sendTransaction(tx, connection, {
        skipPreflight: true,
      });
      await connection.confirmTransaction(transactionSignature, "confirmed");
      refetchCollateralAccount(selectedAccount.pubkey);
      showTransactionToast(transactionSignature);
      resetAmounts();
    } catch (err) {
      console.error("Error during liquidation:", err);
      setError("Liquidation failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Liquidate Tokens</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid w-full items-center gap-4">
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="liquidateAmount">Amount to Burn ($)</Label>
            <Slider
              id="liquidateAmount"
              max={maxLiquidateAmount}
              value={[liquidateAmount]}
              step={BASE_UNIT / 100}
              onValueChange={handleLiquidateAmountChange}
              disabled={isMaxLiquidate}
            />
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                ${(liquidateAmount / BASE_UNIT).toFixed(3)} / $
                {(maxLiquidateAmount / BASE_UNIT).toFixed(3)} tokens
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="maxLiquidate"
                  checked={isMaxLiquidate}
                  onCheckedChange={handleMaxLiquidateToggle}
                />
                <Label htmlFor="maxLiquidate">Max</Label>
              </div>
            </div>
          </div>
          <div className="flex flex-col space-y-1.5">
            <Label>SOL to Receive</Label>
            <div className="text-2xl font-bold">
              {solToReceive.toFixed(3)} SOL
            </div>
            <div className="text-sm text-muted-foreground">
              Including {liquidationBonus.toFixed(3)} SOL bonus (
              {Number(config?.liquidationBonus)}%)
            </div>
          </div>
          <div className="flex flex-col space-y-1.5">
            <Label>Health Factor</Label>
            <progress
              value={healthFactor}
              max={
                config?.minHealthFactor
                  ? Number(config.minHealthFactor) * 2
                  : 200
              }
              className="w-full"
            ></progress>
            <div className="text-sm text-muted-foreground">
              {remainingMinted === 0
                ? "N/A (All tokens burned)"
                : `${healthFactor.toFixed(2)} (Min: ${Number(config?.minHealthFactor) || 0})`}
            </div>
          </div>
          <Button
            onClick={handleLiquidate}
            disabled={!connected || !!error || isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              "Liquidate"
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
      </CardContent>
    </Card>
  );
};

export default LiquidateUI;
