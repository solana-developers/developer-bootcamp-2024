import React, { useState, useMemo, useEffect } from "react";
import { useCollateral } from "../providers/collateral-account-provider";
import { usePythPrice } from "../providers/pyth-pricefeed-provider";
import { useConfig } from "../providers/config-account-provider";
import { calculateHealthFactor, getUsdValue } from "@/app/utils";
import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { ExternalLink } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import LiquidateUI from "./liquidate";

interface SelectedAccount {
  pubkey: PublicKey;
  lamportBalanceInSol: number;
  lamportBalanceInUsd: number;
  amountMintedInUsd: number;
  healthFactor: number;
}

// Display all collateral accounts on liquidation page
const CollateralAccountsTable = () => {
  const { allCollateralAccounts } = useCollateral();
  const { solPriceFeed } = usePythPrice();
  const { config } = useConfig();
  const [selectedAccount, setSelectedAccount] =
    useState<SelectedAccount | null>(null);

  const accountsData = useMemo(() => {
    if (!allCollateralAccounts || !solPriceFeed || !config) return [];

    return allCollateralAccounts.map((account) => {
      const lamportBalanceInSol =
        account.account.lamportBalance / LAMPORTS_PER_SOL;
      const lamportBalanceInUsd =
        getUsdValue(account.account.lamportBalance, solPriceFeed) /
        LAMPORTS_PER_SOL;
      const amountMintedInUsd = account.account.amountMinted / 1e9;
      const healthFactor = calculateHealthFactor(
        account.account.lamportBalance,
        account.account.amountMinted,
        config.liquidationThreshold,
        solPriceFeed,
      );

      return {
        pubkey: account.publicKey,
        lamportBalanceInSol,
        lamportBalanceInUsd,
        amountMintedInUsd,
        healthFactor,
      };
    });
  }, [allCollateralAccounts, solPriceFeed, config]);

  useEffect(() => {
    if (selectedAccount) {
      const updatedAccount = accountsData.find(
        (account) =>
          account.pubkey.toString() === selectedAccount.pubkey.toString(),
      );
      if (updatedAccount) {
        setSelectedAccount(updatedAccount);
      }
    }
  }, [accountsData, selectedAccount]);

  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>Collateral Account Details</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Collateral Account</TableHead>
                <TableHead>SOL Balance</TableHead>
                <TableHead>Tokens Owed ($)</TableHead>
                <TableHead>Health Factor</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {accountsData.map((account) => (
                <TableRow key={account.pubkey.toString()}>
                  <TableCell>
                    <AddressLink pubkey={account.pubkey} />
                  </TableCell>
                  <TableCell>
                    {account.lamportBalanceInSol.toFixed(3)} ($
                    {account.lamportBalanceInUsd.toFixed(2)})
                  </TableCell>
                  <TableCell>${account.amountMintedInUsd.toFixed(2)}</TableCell>
                  <TableCell
                    className={
                      isNaN(account.healthFactor)
                        ? ""
                        : account.healthFactor < config?.minHealthFactor
                          ? "text-red-500"
                          : "text-green-500"
                    }
                  >
                    {account.healthFactor.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          onClick={() => setSelectedAccount(account)}
                          disabled={
                            isNaN(account.healthFactor) ||
                            account.healthFactor >=
                              (Number(config?.minHealthFactor) || 0)
                          }
                        >
                          Liquidate
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="flex items-center justify-center border-none bg-transparent">
                        {selectedAccount && (
                          <LiquidateUI selectedAccount={selectedAccount} />
                        )}
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default CollateralAccountsTable;

const AddressLink = ({ pubkey }: { pubkey: PublicKey }) => {
  const address = pubkey.toString();
  const shortenedAddress = `${address.slice(0, 4)}...${address.slice(-4)}`;
  const explorerUrl = `https://explorer.solana.com/address/${address}?cluster=devnet`;

  return (
    <a
      href={explorerUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center text-blue-500 hover:underline"
    >
      {shortenedAddress}
      <ExternalLink className="ml-1 h-3 w-3" />
    </a>
  );
};
