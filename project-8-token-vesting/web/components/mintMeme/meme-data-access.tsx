"use client";

import { WalletContextState } from "@solana/wallet-adapter-react";
import {
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import toast from "react-hot-toast";
import {
  createAssociatedTokenAccountInstruction,
  createInitializeMintInstruction,
  createMintToInstruction,
  getAssociatedTokenAddress,
  MINT_SIZE,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { useMutation } from "@tanstack/react-query";
import { useTransactionToast } from "../ui/ui-layout";
import { useRouter } from "next/navigation";

export const useCreateMintAndTokenAccount = () => {
  const transactionToast = useTransactionToast();
  const createMintAndTokenAccount = useMutation<
    { signature: string; mint: PublicKey; associatedTokenAccount: PublicKey },
    Error,
    {
      connection: Connection;
      walletAdapter: WalletContextState;
      tokenAmount: number | bigint | string;
    }
  >({
    mutationKey: ["mintToken", "create"],
    mutationFn: async ({ connection, walletAdapter, tokenAmount }) => {
      if (!walletAdapter || !walletAdapter.connected) {
        throw new Error("Wallet not connected. Please connect your wallet.");
      }

      const walletPublicKey = walletAdapter.publicKey;
      if (!walletPublicKey) {
        throw new Error("Wallet public key not available.");
      }

      const mint = Keypair.generate();
      const associatedTokenAccount = await getAssociatedTokenAddress(
        mint.publicKey,
        walletPublicKey
      );

      const { blockhash } = await connection.getLatestBlockhash();
      const transaction = new Transaction({
        recentBlockhash: blockhash,
        feePayer: walletPublicKey,
      });

      const mintRent = await connection.getMinimumBalanceForRentExemption(
        MINT_SIZE
      );
      const decimals = 9;
      const mintAmount = BigInt(tokenAmount) * BigInt(10 ** decimals);

      transaction.add(
        SystemProgram.createAccount({
          fromPubkey: walletPublicKey,
          newAccountPubkey: mint.publicKey,
          lamports: mintRent,
          space: MINT_SIZE,
          programId: TOKEN_PROGRAM_ID,
        }),
        createInitializeMintInstruction(
          mint.publicKey,
          decimals,
          walletPublicKey,
          walletPublicKey
        ),
        createAssociatedTokenAccountInstruction(
          walletPublicKey,
          associatedTokenAccount,
          walletPublicKey,
          mint.publicKey
        ),
        createMintToInstruction(
          mint.publicKey,
          associatedTokenAccount,
          walletPublicKey,
          mintAmount
        )
      );

      transaction.partialSign(mint);

      if (!walletAdapter.signTransaction) {
        toast.error(
          "The wallet adapter does not support signing transactions."
        );
        throw new Error(
          "The wallet adapter does not support signing transactions."
        );
      }
      const signedTransaction = await walletAdapter.signTransaction(
        transaction
      );
      const signature = await connection.sendRawTransaction(
        signedTransaction.serialize(),
        {
          skipPreflight: false,
        }
      );
      return { signature, mint: mint.publicKey, associatedTokenAccount };
    },
    onSuccess: async ({ signature }) => {
      transactionToast(signature);
    },
    onError: (error) => {
      toast.error(`Failed to create mint token: ${error.message}`);
    },
  });
  return { createMintAndTokenAccount };
};
