"use client";

import { PublicKey } from "@solana/web3.js";
import { useMemo, useState } from "react";
import {
  useVestingProgram,
  useVestingProgramAccount,
} from "./vesting-data-access";
import { useWallet } from "@solana/wallet-adapter-react";

export function VestingCreate() {
  const { createVestingAccount } = useVestingProgram();
  const { publicKey } = useWallet();
  const [company, setCompany] = useState("");
  const [mint, setMint] = useState("");

  const isFormValid = company.length > 0;

  const handleSubmit = () => {
    if (publicKey && isFormValid) {
      createVestingAccount.mutateAsync({ companyName: company, mint: mint });
    }
  };

  if (!publicKey) {
    return <p>Connect your wallet</p>;
  }

  return (
    <div>
      <input
        type="text"
        placeholder="Company Name"
        value={company}
        onChange={(e) => setCompany(e.target.value)}
        className="input input-bordered w-full max-w-xs"
      />
      <input
        type="text"
        placeholder="Token Mint Address"
        value={mint}
        onChange={(e) => setMint(e.target.value)}
        className="input input-bordered w-full max-w-xs"
      />
      <button
        className="btn btn-xs lg:btn-md btn-primary"
        onClick={handleSubmit}
        disabled={createVestingAccount.isPending || !isFormValid}
      >
        Create New Vesting Account {createVestingAccount.isPending && "..."}
      </button>
    </div>
  );
}

export function VestingList() {
  const { accounts, getProgramAccount } = useVestingProgram();

  if (getProgramAccount.isLoading) {
    return <span className="loading loading-spinner loading-lg"></span>;
  }
  if (!getProgramAccount.data?.value) {
    return (
      <div className="alert alert-info flex justify-center">
        <span>
          Program account not found. Make sure you have deployed the program and
          are on the correct cluster.
        </span>
      </div>
    );
  }
  return (
    <div className={"space-y-6"}>
      {accounts.isLoading ? (
        <span className="loading loading-spinner loading-lg"></span>
      ) : accounts.data?.length ? (
        <div className="grid md:grid-cols-2 gap-4">
          {accounts.data?.map((account) => (
            <VestingCard
              key={account.publicKey.toString()}
              account={account.publicKey}
            />
          ))}
        </div>
      ) : (
        <div className="text-center">
          <h2 className={"text-2xl"}>No accounts</h2>
          No accounts found. Create one above to get started.
        </div>
      )}
    </div>
  );
}

function VestingCard({ account }: { account: PublicKey }) {
  const { accountQuery, createEmployeeVesting } = useVestingProgramAccount({
    account,
  });
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(0);
  const [cliffTime, setCliffTime] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);

  const companyName = useMemo(
    () => accountQuery.data?.companyName ?? 0,
    [accountQuery.data?.companyName]
  );

  return accountQuery.isLoading ? (
    <span className="loading loading-spinner loading-lg"></span>
  ) : (
    <div className="card card-bordered border-base-300 border-4 text-neutral-content">
      <div className="card-body items-center text-center">
        <div className="space-y-6">
          <h2
            className="card-title justify-center text-3xl cursor-pointer"
            onClick={() => accountQuery.refetch()}
          >
            {companyName}
          </h2>
          <div className="card-actions justify-around">
            <input
              type="text"
              placeholder="Start Time"
              value={startTime || ""}
              onChange={(e) => setStartTime(parseInt(e.target.value))}
              className="input input-bordered w-full max-w-xs"
            />
            <input
              type="text"
              placeholder="End Time"
              value={endTime || ""}
              onChange={(e) => setEndTime(parseInt(e.target.value))}
              className="input input-bordered w-full max-w-xs"
            />
            <input
              type="text"
              placeholder="Cliff Time"
              value={cliffTime || ""}
              onChange={(e) => setCliffTime(parseInt(e.target.value))}
              className="input input-bordered w-full max-w-xs"
            />
            <input
              type="text"
              placeholder="Total Allocation"
              value={totalAmount || ""}
              onChange={(e) => setTotalAmount(parseInt(e.target.value))}
              className="input input-bordered w-full max-w-xs"
            />
            <button
              className="btn btn-xs lg:btn-md btn-outline"
              onClick={() =>
                createEmployeeVesting.mutateAsync({
                  startTime,
                  endTime,
                  totalAmount,
                  cliffTime,
                })
              }
              disabled={createEmployeeVesting.isPending}
            >
              Create Employee Vesting Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
