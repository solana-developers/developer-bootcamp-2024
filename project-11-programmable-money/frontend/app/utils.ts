import { PriceFeed } from "@pythnetwork/price-service-client";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";

const PRICE_FEED_DECIMAL_ADJUSTMENT = 10; // price feed 1e8, adjust to same base unit as SOL
export const BASE_UNIT = LAMPORTS_PER_SOL; // 1e9

export function calculateHealthFactor(
  lamportBalance: number,
  amountMinted: number,
  liquidationThreshold: number,
  priceFeed: PriceFeed,
): number {
  const collateralValueInUsd = getUsdValue(lamportBalance, priceFeed);

  const collateralAdjustedForLiquidationThreshold =
    (collateralValueInUsd * liquidationThreshold) / 100;

  if (amountMinted === 0) {
    return Number.MAX_SAFE_INTEGER;
  }

  return collateralAdjustedForLiquidationThreshold / amountMinted;
}

export function getUsdValue(
  amountInLamports: number,
  priceFeed: PriceFeed,
): number {
  const price = priceFeed.getPriceNoOlderThan(60);
  if (!price) {
    throw new Error("Invalid price");
  }

  const priceInUsd = Number(price.price) * PRICE_FEED_DECIMAL_ADJUSTMENT;
  const amountInUsd = (amountInLamports * priceInUsd) / LAMPORTS_PER_SOL;

  return amountInUsd;
}

export function getLamportsFromUsd(
  amountInUsd: number,
  priceFeed: PriceFeed,
): number {
  const price = priceFeed.getPriceNoOlderThan(60);
  if (!price) {
    throw new Error("Invalid price");
  }

  const priceInUsd = Number(price.price) * PRICE_FEED_DECIMAL_ADJUSTMENT;
  const amountInLamports = (amountInUsd * LAMPORTS_PER_SOL) / priceInUsd;

  return amountInLamports;
}
