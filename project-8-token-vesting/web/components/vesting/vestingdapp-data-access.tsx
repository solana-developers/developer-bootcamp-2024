"use client";

import { PublicKey } from "@solana/web3.js";
import { useMutation, useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useCluster } from "../cluster/cluster-data-access";
import { useTransactionToast } from "../ui/ui-layout";
import { ICreateEmployee, ICreateVesting } from "./vesting-types";
import { getAccount, getMint, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { useCommonProgram } from "../common/common-data-access";
import { useRouter } from "next/navigation";
import { useConnection } from "@solana/wallet-adapter-react";
import { IEmployeeVesting } from "../employee/employee-types";

export function useVesting() {
  const router = useRouter();
  const { cluster, program } = useCommonProgram();
  const transactionToast = useTransactionToast();

  const vestingAccounts = useQuery({
    queryKey: ["vestingdapp", "all", { cluster }],
    queryFn: () => program.account.vestingAccount.all(),
  });

  const createVestingAccount = useMutation<string, Error, ICreateVesting>({
    mutationKey: ["vestingdapp", "create", { cluster }],
    mutationFn: ({ companyName, tokenAmountTobeVested, mint }) =>
      program.methods
        .createVestingAccount(companyName, tokenAmountTobeVested)
        .accounts({ mint: new PublicKey(mint), tokenProgram: TOKEN_PROGRAM_ID })
        .rpc(),
    onSuccess: (signature) => {
      transactionToast(signature);
      router.push("/dapptokenvesting");
      return vestingAccounts.refetch();
    },
    onError: () => {
      toast.error("Failed to create vesting account");
      router.push("/createVesting");
    },
  });

  return {
    createVestingAccount,
    vestingAccounts,
  };
}
export function useVestingdappProgramAccount({
  account,
}: {
  account: PublicKey;
}) {
  const { cluster } = useCluster();
  const { program } = useCommonProgram();

  const vestingAccountQuery = useQuery({
    queryKey: ["vestingAccount", "fetch", { cluster, account }],
    queryFn: () => program.account.vestingAccount.fetch(account),
  });

  return {
    vestingAccountQuery,
  };
}

export function useCreateEmployeeVesting() {
  const router = useRouter();
  const { cluster, program } = useCommonProgram();
  const transactionToast = useTransactionToast();
  const createEmployeeAccount = useMutation<string, Error, ICreateEmployee>({
    mutationKey: ["employeeAccount", "create", { cluster }],
    mutationFn: async ({
      startTime,
      endTime,
      totalAmount,
      cliffTime,
      beneficiary,
      vestingAccount,
    }) =>
      program.methods
        .createEmployeeVesting(startTime, endTime, totalAmount, cliffTime)
        .accounts({
          beneficiary,
          vestingAccount,
        })
        .rpc(),
    onSuccess: (signature) => {
      transactionToast(signature);
      router.push("/vestedemployees");
    },
    onError: () => toast.error("Failed to create employee account"),
  });

  return {
    createEmployeeAccount,
  };
}

export function useFetchVestedEmployees() {
  const { vestingAccounts } = useVesting();
  const { cluster } = useCluster();
  const { programId, walletPublicKey } = useCommonProgram();
  const { connection } = useConnection();
  const employeeAccountsQuery = useQuery({
    queryKey: [
      "employeeAccounts",
      "fetch",
      { cluster, vestingAccounts: vestingAccounts.data },
    ],
    queryFn: async () => {
      await vestingAccounts.refetch();
      if (!vestingAccounts.data) {
        return [];
      }
      const employeeAccountsDetails = await Promise.all(
        vestingAccounts.data.map(async (vestingAccount) => {
          if (
            vestingAccount.account.owner.toBase58() ===
            walletPublicKey?.toBase58()
          ) {
            const EmployeeAccounts = await connection.getProgramAccounts(
              programId,
              {
                filters: [
                  {
                    memcmp: {
                      offset: 80,
                      bytes: vestingAccount.publicKey.toBase58(),
                    },
                  },
                ],
              }
            );
            const modifiedEmployeeAccounts = EmployeeAccounts.map((empAcc) => ({
              ...empAcc,
              treasuryTokenAccount: vestingAccount.account.treasuryTokenAccount,
              companyName: vestingAccount.account.companyName,
              token: vestingAccount.account.mint,
            }));
            return modifiedEmployeeAccounts;
          }
          return [];
        })
      );
      const employeeAccounts = employeeAccountsDetails.flat().map((empAcc) => {
        const buffer = Buffer.from(empAcc.account.data);
        const discriminator = buffer.slice(0, 8);
        const beneficiary = new PublicKey(buffer.slice(8, 40)).toBase58();
        const startTime = Number(buffer.readBigInt64LE(40));
        const endTime = Number(buffer.readBigInt64LE(48));
        const totalAmount = Number(buffer.readBigInt64LE(56));
        const totalWithdrawn = Number(buffer.readBigInt64LE(64));
        const cliffTime = Number(buffer.readBigInt64LE(72));
        const vestingAccount = new PublicKey(buffer.slice(80, 112)).toBase58();
        const bump = buffer.readUInt8(112);
        return {
          beneficiary,
          startTime,
          endTime,
          cliffTime,
          totalAmount,
          totalWithdrawn,
          vestingAccount,
          companyName: empAcc.companyName,
          treasuryTokenAccount: empAcc.treasuryTokenAccount.toBase58(),
          token: empAcc.token.toBase58(),
          pda: empAcc.pubkey.toBase58(),
        };
      });
      return employeeAccounts;
    },
  });
  return {
    employeeAccountsQuery,
  };
}
export function useCompanyEmployees({
  treasuryAccount,
}: {
  treasuryAccount: PublicKey;
}) {
  const { employeeAccountsQuery } = useFetchVestedEmployees();
  const { connection } = useConnection();

  const availableTokensInAccountQuery = useQuery({
    queryKey: ["fetch&calc", "availableTokens", treasuryAccount],
    queryFn: async () => {
      try {
        const [employeeResponse, accountInfo, mintInfo] = await Promise.all([
          employeeAccountsQuery.refetch(),
          getAccount(connection, treasuryAccount),
          getMint(
            connection,
            (
              await getAccount(connection, treasuryAccount)
            ).mint
          ),
        ]);
        const employeeData: IEmployeeVesting[] =
          employeeResponse?.data || ([] as IEmployeeVesting[]);
        const allocatedTokens = employeeData.reduce(
          (prev, curr) =>
            prev +
            ((curr.treasuryTokenAccount === treasuryAccount.toString() &&
              curr.totalAmount) ||
              0),
          0
        );
        const availableTokensInAccount =
          Number(accountInfo.amount) / Number(Math.pow(10, mintInfo.decimals)) -
          allocatedTokens;
        return availableTokensInAccount;
      } catch (error) {
        console.log("Error :", error);
        toast.error(
          "Error in fetching employeeresponse,accountInfo or mintInfo "
        );
      }
    },
    enabled: !!treasuryAccount,
  });

  return {
    availableTokensInAccount: availableTokensInAccountQuery.data,
    availableTokensInAccountIsLoading: availableTokensInAccountQuery.isLoading,
    availableTokensInAccountError: availableTokensInAccountQuery.error,
  };
}
