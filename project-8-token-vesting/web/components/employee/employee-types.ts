import { PublicKey } from "@solana/web3.js";

export interface ITokenAccount {
  mintAddress: string;
  tokenAccount: string;
  tokenAmount: number;
}
export interface IClaimableTokens {
  startTime: number;
  endTime: number;
  cliffTime: number;
  totalAmount: number;
  totalWithdrawn: number;
  currentTime: number;
}
export interface IEmployeeVesting {
  pda: string;
  beneficiary: string;
  token: string;
  startTime: number;
  endTime: number;
  cliffTime: number;
  totalAmount: number;
  totalWithdrawn: number;
  treasuryTokenAccount: string;
  vestingAccount: string;
  companyName: string;
}

export interface IClaimTokens {
  companyName: string;
  vestingAccountPubkey: PublicKey;
  employeeAccountPubkey: PublicKey;
  mintPubkey: PublicKey;
  treasuryTokenAccountPubkey: PublicKey;
}
