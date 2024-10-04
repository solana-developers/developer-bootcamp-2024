"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { AccountInfo, PublicKey } from "@solana/web3.js";
import { program, CollateralAccount } from "@/anchor/setup";

// Shared state for program collateral accounts
interface CollateralContextType {
  collateral: CollateralAccount | null;
  collateralAccountPDA: PublicKey | null;
  allCollateralAccounts: { publicKey: PublicKey; account: CollateralAccount }[];
  isLoading: boolean;
  error: string | null;
  refetchCollateralAccount: (pubkey: PublicKey) => Promise<void>;
}

const CollateralContext = createContext<CollateralContextType | undefined>(
  undefined,
);

export function useCollateral() {
  const context = useContext(CollateralContext);
  if (context === undefined) {
    throw new Error("useCollateral must be used within a CollateralProvider");
  }
  return context;
}

export function CollateralProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { connection } = useConnection();
  const { publicKey, connected } = useWallet();
  const [collateral, setCollateral] = useState<CollateralAccount | null>(null);
  const [collateralAccountPDA, setCollateralAccountPDA] =
    useState<PublicKey | null>(null);
  const [allCollateralAccounts, setAllCollateralAccounts] = useState<
    { publicKey: PublicKey; account: CollateralAccount }[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleAccountChange = (accountInfo: AccountInfo<Buffer>) => {
    try {
      const decodedData = program.coder.accounts.decode(
        "collateral",
        accountInfo.data,
      ) as CollateralAccount;
      setCollateral(decodedData);
      setError(null);
    } catch (error) {
      console.error("Error decoding collateral account data:", error);
      setError("Failed to decode collateral account data");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAllCollateralAccounts = async () => {
    try {
      const accounts = await program.account.collateral.all();
      setAllCollateralAccounts(accounts);
    } catch (error) {
      console.error("Error fetching all collateral accounts:", error);
      setError("Failed to fetch all collateral accounts");
    }
  };

  const refetchCollateralAccount = useCallback(async (pubkey: PublicKey) => {
    try {
      const account = await program.account.collateral.fetch(pubkey);
      setAllCollateralAccounts((prevAccounts) => {
        const index = prevAccounts.findIndex((a) => a.publicKey.equals(pubkey));
        if (index !== -1) {
          const newAccounts = [...prevAccounts];
          newAccounts[index] = { publicKey: pubkey, account };
          return newAccounts;
        }
        return prevAccounts;
      });
    } catch (error) {
      console.error("Error refetching collateral account:", error);
      setError("Failed to refetch collateral account");
    }
  }, []);

  useEffect(() => {
    // Fetch all collateral accounts
    fetchAllCollateralAccounts();

    if (!connected || !publicKey) {
      setCollateral(null);
      setCollateralAccountPDA(null);
      setIsLoading(false);
      setError(null);
      return;
    }

    setIsLoading(true);

    const [collateralPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from("collateral"), publicKey.toBuffer()],
      program.programId,
    );

    setCollateralAccountPDA(collateralPDA);

    // Fetch initial account data
    program.account.collateral
      .fetch(collateralPDA)
      .then((data) => {
        setCollateral(data as CollateralAccount);
        setError(null);
      })
      .catch((error) => {
        if (error.message.includes("Account does not exist")) {
          setCollateral(null);
          setError(null);
        } else {
          console.error("Error fetching collateral account:", error);
          setError("Failed to fetch collateral account");
        }
      })
      .finally(() => setIsLoading(false));

    // Subscribe to account changes
    const subscriptionId = connection.onAccountChange(
      collateralPDA,
      handleAccountChange,
    );

    return () => {
      connection.removeAccountChangeListener(subscriptionId);
    };
  }, [connection, publicKey, connected]);

  return (
    <CollateralContext.Provider
      value={{
        collateral,
        collateralAccountPDA,
        allCollateralAccounts,
        isLoading,
        error,
        refetchCollateralAccount,
      }}
    >
      {children}
    </CollateralContext.Provider>
  );
}
