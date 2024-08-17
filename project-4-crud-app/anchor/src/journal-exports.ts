// Here we export some useful types and functions for interacting with the Anchor program.
import { AnchorProvider, Program } from "@coral-xyz/anchor";
import { Cluster, PublicKey } from "@solana/web3.js";
import JournalIDL from "../target/idl/journal.json";
import type { Journal } from "../target/types/journal";

// Re-export the generated IDL and type
export { Journal, JournalIDL };

// After updating your program ID (e.g. after running `anchor keys sync`) update the value below.
export const JOURNAL_PROGRAM_ID = new PublicKey(
  "EZB64BQPMPzGNEV6XvrxTSPcQHCXaRF7aXMgunxQ6LNh"
);

// This is a helper function to get the Counter Anchor program.
export function getJournalProgram(provider: AnchorProvider) {
  return new Program(JournalIDL as Journal, provider);
}

// This is a helper function to get the program ID for the Journal program depending on the cluster.
export function getJournalProgramId(cluster: Cluster) {
  switch (cluster) {
    case "devnet":
    case "testnet":
    case "mainnet-beta":
    default:
      return JOURNAL_PROGRAM_ID;
  }
}
