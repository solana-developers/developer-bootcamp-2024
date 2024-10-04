import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { AlertCircle, Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { program } from "@/anchor/setup";
import { BN } from "@coral-xyz/anchor";

// UI to invoke updateConfig instruction, can be invoked by anyone to test liquidation
const UpdateConfigUI = () => {
  const [configValue, setConfigValue] = useState(100);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { connection } = useConnection();
  const { publicKey, connected, sendTransaction } = useWallet();

  const handleConfigValueChange = (value: string) => {
    const intValue = parseInt(value, 10);
    if (!isNaN(intValue) && intValue > 0) {
      setConfigValue(intValue);
    }
  };

  const handleUpdateConfig = async () => {
    if (!publicKey) {
      setError("Wallet not connected");
      return;
    }
    setIsLoading(true);
    setError("");

    try {
      const tx = await program.methods
        .updateConfig(new BN(configValue))
        .accounts({
          // Add necessary accounts here
        })
        .transaction();

      const transactionSignature = await sendTransaction(tx, connection, {
        skipPreflight: true,
      });
      console.log("Transaction signature", transactionSignature);
      // Handle successful transaction (e.g., show success message, update UI)
    } catch (err) {
      console.error("Error updating config:", err);
      // setError("Failed to update config. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Update Config</CardTitle>
        <CardDescription>
          Increase the minimum health factor to test liquidation. A higher value
          makes it easier to trigger liquidations.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid w-full items-center gap-4">
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="configValue">Minimum Health Factor</Label>
            <Input
              id="configValue"
              type="number"
              value={configValue}
              onChange={(e) => handleConfigValueChange(e.target.value)}
              min="1"
              step="1"
              className="w-full"
            />
          </div>
          <Button
            onClick={handleUpdateConfig}
            disabled={!connected || isLoading}
            className="w-full"
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-6 w-6 animate-spin" />
            ) : null}
            {isLoading ? "Updating..." : "Update Health Factor"}
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

export default UpdateConfigUI;
