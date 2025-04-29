"use client";

import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import {
  getDapptokenvestingProgram,
  getDapptokenvestingProgramId,
} from "@token-vesting/anchor";
import { Cluster } from "@solana/web3.js";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { useCluster } from "../cluster/cluster-data-access";
import { useAnchorProvider } from "../solana/solana-provider";

export function useCommonProgram() {
  const { publicKey: walletPublicKey } = useWallet();
  const { connection } = useConnection();
  const { cluster } = useCluster();
  const provider = useAnchorProvider();
  const programId = useMemo(
    () => getDapptokenvestingProgramId(cluster.network as Cluster),
    [cluster]
  );
  const program = getDapptokenvestingProgram(provider);

  const getProgramAccount = useQuery({
    queryKey: ["get-program-account", { cluster }],
    queryFn: () => connection.getParsedAccountInfo(programId),
  });

  return {
    cluster,
    program,
    programId,
    getProgramAccount,
    walletPublicKey,
  };
}
