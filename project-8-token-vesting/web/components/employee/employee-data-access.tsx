import { PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useCommonProgram } from "../common/common-data-access";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import toast from "react-hot-toast";
import { useTransactionToast } from "../ui/ui-layout";
import { useRouter } from "next/navigation";

export function useEmployee(walletKey: PublicKey) {
  const { cluster, program } = useCommonProgram();
  const wallet = useWallet();
  const { connection } = useConnection();
  const router = useRouter();

  const transactionToast = useTransactionToast();

  const calculateClaimableTokens = (
    startTime: number,
    endTime: number,
    cliffTime: number,
    totalAmount: number,
    totalWithdrawn: number,
    currentTime: number
  ): number => {
    if (currentTime < cliffTime) {
      return 0;
    }

    const elapsedTime = Math.min(currentTime, endTime) - startTime;
    const vestingDuration = endTime - startTime;

    if (vestingDuration <= 0) {
      throw new Error(
        "Invalid vesting schedule: endTime must be greater than startTime."
      );
    }

    const vestableAmount = (totalAmount * elapsedTime) / vestingDuration;
    const claimableTokens = Math.max(0, vestableAmount - totalWithdrawn);

    return claimableTokens;
  };

  const employeeAccounts = useQuery({
    queryKey: ["employeeTokenVestingAccounts", "all", { cluster }],
    queryFn: async () => {
      const queryResponse = await program.account.employeeAccount.all([
        {
          memcmp: {
            offset: 8,
            bytes: walletKey.toBase58(),
          },
        },
      ]);
      const vestingAccKeys = queryResponse.map(
        (acc) => acc.account.vestingAccount
      );
      const relatedVestingAccounts = await Promise.all(
        vestingAccKeys.map((va) => program.account.vestingAccount.fetch(va))
      );

      const data = queryResponse.map((empAcc, index) => {
        const vestingDetail = relatedVestingAccounts[index];
        return {
          pda: empAcc.publicKey.toString(),
          beneficiary: empAcc.account.beneficiary.toString(),
          startTime: empAcc.account.startTime.toNumber(),
          endTime: empAcc.account.endTime.toNumber(),
          totalAmount: empAcc.account.totalAmount.toNumber(),
          totalWithdrawn: empAcc.account.totalWithdrawn.toNumber(),
          cliffTime: empAcc.account.cliffTime.toNumber(),
          vestingAccount: empAcc.account.vestingAccount.toString(),
          companyName: vestingDetail.companyName,
          treasuryTokenAccount: vestingDetail.treasuryTokenAccount.toString(),
          token: vestingDetail.mint.toString(),
        };
      });
      return data;
    },
  });

  const claimTokens = useMutation({
    mutationKey: ["claim-tokens"],
    mutationFn: async ({
      companyName,
      vestingAccountPubkey,
      employeeAccountPubkey,
      mintPubkey,
      treasuryTokenAccountPubkey,
    }: {
      companyName: string;
      vestingAccountPubkey: PublicKey;
      employeeAccountPubkey: PublicKey;
      mintPubkey: PublicKey;
      treasuryTokenAccountPubkey: PublicKey;
    }) => {
      if (!walletKey) {
        throw new Error("Wallet or program is not initialized.");
      }

      const ata = await getAssociatedTokenAddress(
        mintPubkey,
        walletKey,
        false,
        TOKEN_PROGRAM_ID,
        ASSOCIATED_TOKEN_PROGRAM_ID
      );

      const { blockhash } = await connection.getLatestBlockhash();
      const transaction = new Transaction({
        recentBlockhash: blockhash,
        feePayer: walletKey,
      });

      const instruction = await program.methods
        .claimTokens(companyName)
        .accounts({
          beneficiary: walletKey,
          employeeAccount: employeeAccountPubkey,
          vestingAccount: vestingAccountPubkey,
          mint: mintPubkey,
          treasuryTokenAccount: treasuryTokenAccountPubkey,
          employeeTokenAccount: ata,
          tokenProgram: TOKEN_PROGRAM_ID,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
        } as any)
        .instruction();
      transaction.add(instruction);

      if (!wallet.signTransaction) {
        toast.error(
          "The wallet adapter does not support signing transactions."
        );
        throw new Error(
          "The wallet adapter does not support signing transactions."
        );
      }
      const signedTransaction = await wallet.signTransaction(transaction);
      const signature = await connection.sendRawTransaction(
        signedTransaction.serialize(),
        {
          skipPreflight: false,
        }
      );
      transactionToast(signature);
      router.push("/employeetoken");
      return signature;
    },
    onError: (error: Error) => {
      toast.error(`Claim tokens failed: ${error.message}`);
    },
  });

  return { employeeAccounts, calculateClaimableTokens, claimTokens };
}
