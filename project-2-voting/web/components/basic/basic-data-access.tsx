"use client";

import { programId, getBasicProgram } from "@voting/anchor";
import { BN, Program } from "@coral-xyz/anchor";
import { useConnection } from "@solana/wallet-adapter-react";
import { Keypair } from "@solana/web3.js";
import { useMutation, useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useCluster } from "../cluster/cluster-data-access";
import { useAnchorProvider } from "../solana/solana-provider";
import { useTransactionToast } from "../ui/ui-layout";

interface CreateNewPoll {
  pollId: BN;
  startTime: BN;
  endTime: BN;
  name: string;
  description: string;
}

export function useBasicProgram() {
  const { connection } = useConnection();
  const { cluster } = useCluster();
  const transactionToast = useTransactionToast();
  const provider = useAnchorProvider();
  const program = getBasicProgram(provider);
  const pollId: BN = new BN(Number(1));
  const startTime: BN = new BN(Number(1747065554));
  const endTime: BN = new BN(Number(1847065554));

  const getProgramAccount = useQuery({
    queryKey: ["get-program-account", { cluster }],
    queryFn: () => connection.getParsedAccountInfo(programId),
  });

  const newPoll = useMutation<string, Error, CreateNewPoll>({
    mutationKey: ["newPoll", "create", { cluster }],
    mutationFn: async ({ name, description }) => {
      return program.methods
        .initializePoll(pollId, startTime, endTime, name, description)
        .rpc();
    },
    onSuccess: (signature) => {
      transactionToast(signature);
    },
    onError: () => toast.error("Failed to run program"),
  });

  return {
    program,
    programId,
    getProgramAccount,
    newPoll,
  };
}
