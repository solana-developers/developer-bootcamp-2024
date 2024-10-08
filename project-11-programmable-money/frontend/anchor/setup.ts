import { clusterApiUrl, Connection, PublicKey } from "@solana/web3.js";
import { IdlAccounts, Program } from "@coral-xyz/anchor";
import type { Stablecoin } from "./idlType";
import idl from "./idl.json";

const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

export const program = new Program(idl as Stablecoin, {
  connection,
});

export const [configPDA] = PublicKey.findProgramAddressSync(
  [Buffer.from("config")],
  program.programId,
);

export type ConfigAccount = IdlAccounts<Stablecoin>["config"];
export type CollateralAccount = IdlAccounts<Stablecoin>["collateral"];
