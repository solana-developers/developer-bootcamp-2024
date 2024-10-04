import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { useCollateral } from "../providers/collateral-account-provider";
import { usePythPrice } from "../providers/pyth-pricefeed-provider";
import { useConfig } from "../providers/config-account-provider";
import { calculateHealthFactor, getUsdValue } from "@/app/utils";
import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { ExternalLink } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

// Display connected wallet's collateral account on deposit/withdraw page
const CollateralAccountDisplay = () => {
  const { collateral, collateralAccountPDA, isLoading, error } =
    useCollateral();
  const { solPriceFeed } = usePythPrice();
  const { config } = useConfig();

  if (isLoading) {
    return (
      <Card className="w-[400px]">
        <CardHeader>
          <CardTitle>Collateral Account Details</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="mb-2 h-4 w-full" />
          <Skeleton className="mb-2 h-4 w-full" />
          <Skeleton className="mb-2 h-4 w-full" />
          <Skeleton className="h-4 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-[400px]">
        <CardHeader>
          <CardTitle>Error</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-500">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (!collateral || !solPriceFeed || !config) {
    return (
      <Card className="w-[400px]">
        <CardHeader>
          <CardTitle>No Data</CardTitle>
        </CardHeader>
        <CardContent>
          <p>No collateral data available</p>
        </CardContent>
      </Card>
    );
  }

  const lamportBalanceInSol = collateral.lamportBalance / LAMPORTS_PER_SOL;
  const lamportBalanceInUsd =
    getUsdValue(collateral.lamportBalance, solPriceFeed) / LAMPORTS_PER_SOL;
  const amountMintedInUsd = collateral.amountMinted / 1e9;
  const healthFactor = calculateHealthFactor(
    collateral.lamportBalance,
    collateral.amountMinted,
    config.liquidationThreshold,
    solPriceFeed,
  );

  return (
    <Card className="w-[400px]">
      <CardHeader>
        <CardTitle>Collateral Account Details</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableBody>
            <InfoRow
              label="Collateral PDA"
              value={
                collateralAccountPDA ? (
                  <AddressLink pubkey={collateralAccountPDA} />
                ) : (
                  "N/A"
                )
              }
            />
            <InfoRow
              label="Depositor"
              value={<AddressLink pubkey={collateral.depositor} />}
            />
            <InfoRow
              label="SOL Account"
              value={<AddressLink pubkey={collateral.solAccount} />}
            />
            <InfoRow
              label="Token Account"
              value={<AddressLink pubkey={collateral.tokenAccount} />}
            />
            <InfoRow
              label="SOL Collateral Balance"
              value={`${lamportBalanceInSol.toFixed(3)} SOL ($${lamportBalanceInUsd.toFixed(2)})`}
            />
            <InfoRow
              label="Stablecoins Owed"
              value={`$${amountMintedInUsd.toFixed(3)}`}
            />
            <InfoRow
              label="Health Factor"
              value={
                <span
                  className={
                    healthFactor < config.minHealthFactor
                      ? "text-red-500"
                      : "text-green-500"
                  }
                >
                  {healthFactor.toFixed(2)}
                </span>
              }
            />
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default CollateralAccountDisplay;

const InfoRow = ({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) => (
  <TableRow>
    <TableCell className="font-medium">{label}</TableCell>
    <TableCell className="text-right">{value}</TableCell>
  </TableRow>
);

const AddressLink = ({ pubkey }: { pubkey: PublicKey }) => {
  const address = pubkey.toString();
  const shortenedAddress = `${address.slice(0, 4)}...${address.slice(-4)}`;
  const explorerUrl = `https://explorer.solana.com/address/${address}?cluster=devnet`;

  return (
    <a
      href={explorerUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center justify-end text-blue-500 hover:underline"
    >
      {shortenedAddress}
      <ExternalLink className="ml-1 h-3 w-3" />
    </a>
  );
};
