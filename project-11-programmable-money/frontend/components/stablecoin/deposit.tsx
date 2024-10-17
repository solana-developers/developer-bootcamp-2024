import React, { useState, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useConfig } from "../providers/config-account-provider";
import { useCollateral } from "../providers/collateral-account-provider";
import { usePythPrice } from "../providers/pyth-pricefeed-provider";
import { calculateHealthFactor, getUsdValue, BASE_UNIT } from "@/app/utils";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { program } from "@/anchor/setup";
import { BN } from "@coral-xyz/anchor";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { Loader2 } from "lucide-react";
import { useTransactionToast } from "./toast";

// UI to invoke depositCollateralAndMint instruction
const CollateralMintUI = () => {
  const [depositAmount, setDepositAmount] = useState(0);
  const [mintAmount, setMintAmount] = useState(0);
  const [maxMintAmount, setMaxMintAmount] = useState(0);
  const [healthFactor, setHealthFactor] = useState(0);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { config } = useConfig();
  const { collateral } = useCollateral();
  const { solPriceFeed, solUsdPriceFeedAccount } = usePythPrice();
  const { connection } = useConnection();
  const { publicKey, connected, sendTransaction } = useWallet();
  const { showTransactionToast } = useTransactionToast();

  const updateCalculations = useCallback(() => {
    if (solPriceFeed && config) {
      const existingCollateral = Number(collateral?.lamportBalance) || 0;
      const existingMinted = Number(collateral?.amountMinted) || 0;

      const depositLamports = depositAmount * LAMPORTS_PER_SOL;
      const totalCollateralLamports = existingCollateral + depositLamports;

      const totalCollateralUsd = getUsdValue(
        totalCollateralLamports,
        solPriceFeed,
      );

      const newMaxMintAmount = Math.floor(
        (totalCollateralUsd * config.liquidationThreshold) / 100,
      );

      setMaxMintAmount(Math.max(0, newMaxMintAmount - existingMinted));

      const totalMintedAmount = existingMinted + mintAmount;

      if (totalMintedAmount > 0) {
        const newHealthFactor = calculateHealthFactor(
          totalCollateralLamports,
          totalMintedAmount,
          config.liquidationThreshold,
          solPriceFeed,
        );
        setHealthFactor(newHealthFactor);

        if (newHealthFactor < config.minHealthFactor) {
          setError("Warning: Health factor would be below minimum");
        } else {
          setError("");
        }
      } else {
        setHealthFactor(0);
      }
    }
  }, [depositAmount, mintAmount, solPriceFeed, config, collateral]);

  useEffect(() => {
    updateCalculations();
  }, [updateCalculations]);

  const handleDepositAmountChange = (value: number) => {
    setDepositAmount(value);
  };

  const handleMintAmountChange = (value: number) => {
    setMintAmount(value);
  };

  const resetAmounts = () => {
    setDepositAmount(0);
    setMintAmount(0);
  };

  const handleDeposit = async () => {
    if (!publicKey || !solPriceFeed) {
      setError("Wallet not connected or price feed unavailable");
      return;
    }

    setIsLoading(true);

    try {
      const amountCollateral = new BN(depositAmount * LAMPORTS_PER_SOL);
      const amountToMint = new BN(mintAmount);

      const tx = await program.methods
        .depositCollateralAndMint(amountCollateral, amountToMint)
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
      console.error("Error depositing collateral and minting:", err);
      // setError("Failed to deposit collateral and mint tokens");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid w-full items-center gap-4">
      <div className="flex flex-col space-y-1.5">
        <Label htmlFor="depositAmount">Deposit Amount (SOL)</Label>
        <Input
          id="depositAmount"
          type="number"
          value={depositAmount}
          onChange={(e) =>
            handleDepositAmountChange(parseFloat(e.target.value) || 0)
          }
        />
      </div>
      <div className="flex flex-col space-y-1.5">
        <Label htmlFor="mintAmount">Mint Amount ($)</Label>
        <Slider
          id="mintAmount"
          max={maxMintAmount}
          step={BASE_UNIT / 100}
          value={[mintAmount]}
          onValueChange={(value) => handleMintAmountChange(value[0])}
        />
        <div className="text-sm text-muted-foreground">
          ${(mintAmount / BASE_UNIT).toFixed(2)} / $
          {(maxMintAmount / BASE_UNIT).toFixed(2)}
        </div>
      </div>
      <div className="flex flex-col space-y-1.5">
        <Label>Health Factor</Label>
        <progress
          value={healthFactor}
          max={config?.minHealthFactor * 2 || 0}
          className="w-full"
        ></progress>
        <div className="text-sm text-muted-foreground">
          {healthFactor === 0
            ? "N/A (No tokens minted)"
            : healthFactor.toFixed(2)}
        </div>
      </div>
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <Button
        onClick={handleDeposit}
        disabled={!connected || !!error || isLoading}
      >
        {isLoading ? (
          <Loader2 className="h-6 w-6 animate-spin" />
        ) : (
          "Deposit and Mint"
        )}
      </Button>
    </div>
  );
};

export default CollateralMintUI;
