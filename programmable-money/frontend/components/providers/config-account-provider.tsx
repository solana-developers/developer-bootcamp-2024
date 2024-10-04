"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useConnection } from "@solana/wallet-adapter-react";
import { AccountInfo } from "@solana/web3.js";
import { program, configPDA, ConfigAccount } from "@/anchor/setup";

// Shared state for program config account
interface ConfigContextType {
  config: ConfigAccount | null;
  isLoading: boolean;
  error: string | null;
}

const ConfigContext = createContext<ConfigContextType | undefined>(undefined);

export function useConfig() {
  const context = useContext(ConfigContext);
  if (context === undefined) {
    throw new Error("useConfig must be used within a ConfigProvider");
  }
  return context;
}

export function ConfigProvider({ children }: { children: React.ReactNode }) {
  const { connection } = useConnection();
  const [config, setConfig] = useState<ConfigAccount | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleAccountChange = (accountInfo: AccountInfo<Buffer>) => {
    try {
      const decodedData = program.coder.accounts.decode(
        "config",
        accountInfo.data,
      ) as ConfigAccount;
      setConfig(decodedData);
      setError(null);
    } catch (error) {
      console.error("Error decoding config account data:", error);
      setError("Failed to decode config account data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Fetch initial account data
    program.account.config
      .fetch(configPDA)
      .then(setConfig)
      .catch((error) => {
        console.error("Error fetching config account:", error);
        setError("Failed to fetch config account");
        setIsLoading(false);
      });

    // Subscribe to account changes
    const subscriptionId = connection.onAccountChange(
      configPDA,
      handleAccountChange,
    );

    return () => {
      connection.removeAccountChangeListener(subscriptionId);
    };
  }, [connection]);

  return (
    <ConfigContext.Provider value={{ config, isLoading, error }}>
      {children}
    </ConfigContext.Provider>
  );
}
