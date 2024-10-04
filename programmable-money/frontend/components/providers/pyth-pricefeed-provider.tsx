"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import {
  PriceServiceConnection,
  PriceFeed,
} from "@pythnetwork/price-service-client";
import { PublicKey } from "@solana/web3.js";

const SOL_PRICE_FEED_ID =
  "0xef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d";

const SOL_USD_PRICE_FEED_ACCOUNT = new PublicKey(
  "7UVimffxr9ow1uXYxsr4LHAcV58mLzhmwaeKvJ1pjLiE",
);

// Shared state for pyth price feed
interface PythPriceContextType {
  solPriceFeed: PriceFeed | null;
  solUsdPriceFeedAccount: PublicKey;
  isLoading: boolean;
  error: string | null;
}

const PythPriceContext = createContext<PythPriceContextType | undefined>(
  undefined,
);

export function usePythPrice() {
  const context = useContext(PythPriceContext);
  if (context === undefined) {
    throw new Error("usePythPrice must be used within a PythPriceProvider");
  }
  return context;
}

export function PythPriceProvider({ children }: { children: React.ReactNode }) {
  const [solPriceFeed, setSolPriceFeed] = useState<PriceFeed | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const priceServiceConnection = new PriceServiceConnection(
      "https://hermes.pyth.network",
    );

    const fetchInitialPrice = async () => {
      try {
        const priceFeed = await priceServiceConnection.getLatestPriceFeeds([
          SOL_PRICE_FEED_ID,
        ]);

        if (priceFeed && priceFeed.length > 0) {
          setSolPriceFeed(priceFeed[0]);
        } else {
          setError("No price feeds returned");
        }
        setIsLoading(false);
      } catch (err) {
        setError("Failed to fetch initial SOL price");
        setIsLoading(false);
      }
    };

    fetchInitialPrice();

    priceServiceConnection.subscribePriceFeedUpdates(
      [SOL_PRICE_FEED_ID],
      (priceFeed) => {
        setSolPriceFeed(priceFeed);
      },
    );

    return () => {
      priceServiceConnection.closeWebSocket();
    };
  }, []);

  return (
    <PythPriceContext.Provider
      value={{
        solPriceFeed,
        solUsdPriceFeedAccount: SOL_USD_PRICE_FEED_ACCOUNT,
        isLoading,
        error,
      }}
    >
      {children}
    </PythPriceContext.Provider>
  );
}
