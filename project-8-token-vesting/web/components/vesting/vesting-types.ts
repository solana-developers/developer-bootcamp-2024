import { PublicKey } from "@solana/web3.js";
import BN from "bn.js";

export interface ICreateVesting {
  companyName: string;
  tokenAmountTobeVested: BN;
  mint: string;
}
export interface IVestingAccount {
  owner: PublicKey;
  mint: PublicKey;
  treasuryTokenAccount: PublicKey;
  companyName: string;
  treasuryBump: number;
  bump: number;
}

export interface ICreateEmployee {
  startTime: BN;
  endTime: BN;
  totalAmount: BN;
  cliffTime: BN;
  beneficiary: PublicKey;
  vestingAccount: PublicKey;
}

export interface IEmployeeVesting {
  beneficiary: string;
  startTime: number;
  endTime: number;
  totalAmount: number;
  totalWithdrawn: number;
  cliffTime: number;
  vestingAccount: string;
  companyName: string;
  treasuryTokenAccount: string;
  token: string;
  pda: string;
}
