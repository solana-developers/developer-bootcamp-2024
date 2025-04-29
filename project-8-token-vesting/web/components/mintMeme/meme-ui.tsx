"use client";

import { useMemo, useState } from "react";
import { useCreateMintAndTokenAccount } from "./meme-data-access";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import Link from "next/link";
import PerfectScrollbar from "react-perfect-scrollbar";
import "react-perfect-scrollbar/dist/css/styles.css";
import { useRouter } from "next/navigation";
import Loader from "../common/common-loader";
import { useGetTokenAccounts } from "../account/account-data-access";
import { AccountInfo, ParsedAccountData, PublicKey } from "@solana/web3.js";
import { ExplorerLink } from "../cluster/cluster-ui";

export function MemeTokenCreate({ publicKey }: { publicKey: PublicKey }) {
  const wallet = useWallet();
  const { connection } = useConnection();
  const router = useRouter();
  const [tokenAmount, setTokenAmount] = useState<string>("");
  const { createMintAndTokenAccount } = useCreateMintAndTokenAccount();
  const [isSignatureConfirming, setIsSignatureConfirming] =
    useState<boolean>(false);

  return (
    <div className="p-4 space-y-4 max-w-lg mx-auto">
      <input
        type="text"
        placeholder="Enter Initial Token Amount"
        value={tokenAmount}
        onChange={(e) => setTokenAmount(e.target.value)}
        className="w-full p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-300"
      />
      <button
        className="btn lg:btn-md btn-primary w-full"
        onClick={async () => {
          setIsSignatureConfirming(true);
          await createMintAndTokenAccount
            .mutateAsync({
              connection,
              walletAdapter: wallet,
              tokenAmount: parseInt(tokenAmount),
            })
            .then(async (data) => {
              setTokenAmount("");
              await connection.confirmTransaction(data.signature, "confirmed");
              router.push("/mint");
            })
            .finally(() => setIsSignatureConfirming(false));
        }}
        disabled={createMintAndTokenAccount.isPending || !tokenAmount}
      >
        {createMintAndTokenAccount.isPending ? (
          <Loader width={35} height={35} color="gray-900" />
        ) : isSignatureConfirming ? (
          <div className="w-full flex justify-center items-center gap-2 text-gray-200 bg-bold">
            <div className="w-full flex gap-1">
              <div className="w-full">Signature Confirming... </div>
              <Loader width={10} height={10} color="green-600" />
            </div>
          </div>
        ) : (
          "Create New Token"
        )}
      </button>
    </div>
  );
}

export function MemeTokenList({ publicKey }: { publicKey: PublicKey }) {
  const query = useGetTokenAccounts({ address: publicKey });
  const tokenAccounts = useMemo(() => {
    return query.data;
  }, [query.data]);
  if (tokenAccounts?.length === 0) {
    return (
      <div className=" flex flex-col justify-center mt-24">
        <Link
          href="/createMint"
          className="mb-8 w-full text-center font-semibold border border-gray-500 rounded-md px-4 py-2 transition-all hover:bg-gray-700 active:scale-95 md:text-xl"
        >
          Create New Token Program
        </Link>
        <span>Your connected wallet doesnot have any token accounts.</span>
      </div>
    );
  }
  return (
    <div className={"space-y-6"}>
      {query.isPending ? (
        <div className="w-screen h-96 flex justify-center items-center">
          <span className="loading loading-spinner loading-lg flex justify-center items-center h-96"></span>
        </div>
      ) : tokenAccounts && tokenAccounts?.length > 0 ? (
        <MemeTokenCard account={tokenAccounts} />
      ) : (
        <div className="text-center">
          <h2 className={"text-2xl"}>No accounts</h2>
          No accounts found. Create one above to get started.
        </div>
      )}
    </div>
  );
}

function MemeTokenCard({
  account: tokenAccounts,
}: {
  account: { pubkey: PublicKey; account: AccountInfo<ParsedAccountData> }[];
}) {
  const wallet = useWallet();
  if (!wallet.publicKey) {
    return;
  }
  return (
    <div className="flex justify-center flex-col gap-4 mt-8">
      {tokenAccounts.length === 0 && (
        <Link
          href="/createMint"
          className=" w-full text-center font-semibold border border-gray-500 rounded-md px-4 py-2 transition-all hover:bg-gray-700 active:scale-95 md:text-xl"
        >
          Create New Token Program
        </Link>
      )}
      <div className="container mx-auto p-4">
        <div className="md:relative flex flex-col-reverse gap-4">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-6 text-center">
            Your Token Accounts List
          </h1>
          <Link
            className="md:absolute top-4 right-0 text-center font-semibold rounded-md px-4 py-2 transition-all hover:bg-gray-700 active:scale-95 text-sm"
            href="/createMint"
          >
            + Add New Token
          </Link>
        </div>
        {tokenAccounts.length > 0 ? (
          <div className="overflow-x-auto overflow-y-auto h-[calc(100vh-360px)]">
            <PerfectScrollbar>
              <table className="min-w-full bg-white dark:bg-gray-800 shadow-md rounded-lg border border-gray-200 dark:border-gray-700">
                <thead className="bg-gray-100 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                  <tr>
                    <th className="text-left px-6 py-3 text-gray-600 dark:text-gray-300 font-medium uppercase">
                      Token Account
                    </th>
                    <th className="text-left px-6 py-3 text-gray-600 dark:text-gray-300 font-medium uppercase">
                      Mint Address
                    </th>
                    <th className="text-right px-6 py-3 text-gray-600 dark:text-gray-300 font-medium uppercase">
                      Token Amount
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {tokenAccounts.map(({ account, pubkey }) => (
                    <tr
                      key={pubkey.toString()}
                      className="border-b last:border-none hover:bg-gray-50 dark:hover:bg-gray-700 dark:border-gray-600"
                    >
                      <td className="px-6 py-4 text-gray-800 dark:text-gray-200 break-all">
                        <ExplorerLink
                          label={pubkey.toString()}
                          path={`account/${pubkey.toString()}`}
                        />
                      </td>
                      <td className="px-6 py-4 text-gray-800 dark:text-gray-200 break-all">
                        <ExplorerLink
                          label={account.data.parsed.info.mint.toString()}
                          path={`account/${account.data.parsed.info.mint.toString()}`}
                        />
                      </td>
                      <td className="px-6 py-4 text-right text-gray-800 dark:text-gray-200">
                        {account.data.parsed.info.tokenAmount.uiAmount}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </PerfectScrollbar>
          </div>
        ) : (
          <p className="text-gray-600 text-center">No token accounts found.</p>
        )}
      </div>
    </div>
  );
}
