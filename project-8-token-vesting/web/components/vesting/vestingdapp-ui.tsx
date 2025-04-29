"use client";

import { PublicKey } from "@solana/web3.js";
import { useEffect, useMemo, useState } from "react";
import { useCommonProgram } from "../common/common-data-access";
import {
  useCompanyEmployees,
  useCreateEmployeeVesting,
  useFetchVestedEmployees,
  useVesting,
  useVestingdappProgramAccount,
} from "./vestingdapp-data-access";
import { BN } from "bn.js";
import Loader from "../common/common-loader";
import Link from "next/link";
import PerfectScrollbar from "react-perfect-scrollbar";
import "react-perfect-scrollbar/dist/css/styles.css";
import Flatpickr from "react-flatpickr";
import "flatpickr/dist/themes/material_blue.css";
import { useGetTokenAccounts } from "../account/account-data-access";
import { ellipsify } from "../ui/ui-layout";
import { ExplorerLink } from "../cluster/cluster-ui";
import { IEmployeeVesting } from "./vesting-types";
import { unixTimeStarmp } from "../common/common-utils";
import toast from "react-hot-toast";
export function VestingdappCreate({ publicKey }: { publicKey: PublicKey }) {
  const { createVestingAccount } = useVesting();
  const tokenAccountsQuery = useGetTokenAccounts({ address: publicKey });
  const [companyName, setCompanyName] = useState<string>("");
  const [tokenAmountTobeVested, setTokenAmountTobeVested] = useState(0);
  const [mint, setMint] = useState<string>("");
  const [showDropdown, setShowDropdown] = useState<boolean>(false);

  const handleMintSelect = (selectedMint: string) => {
    setMint(selectedMint);
    setShowDropdown(false);
  };

  useEffect(() => {
    const hideDropDown = () => {
      setShowDropdown(false);
    };
    const handleClick = () => {
      hideDropDown();
    };

    showDropdown && window.addEventListener("click", handleClick);

    return () => {
      window.removeEventListener("click", handleClick);
    };
  }, [document.activeElement, showDropdown]);
  return (
    <div className="px-4 py-2 space-y-4 max-w-lg mx-auto">
      <input
        type="text"
        placeholder="Enter Company Name"
        value={companyName}
        onChange={(e) => setCompanyName(e.target.value)}
        className="w-full p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-300"
      />
      <div className="relative">
        <input
          type="text"
          placeholder="Enter Mint Address"
          value={mint}
          onChange={(e) => setMint(e.target.value)}
          onFocus={() => setShowDropdown(true)}
          onClick={(e) => {
            e.stopPropagation();
            tokenAccountsQuery.refetch();
            setShowDropdown(true);
          }}
          className="w-full p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-300"
        />
        {showDropdown && (
          <div className="absolute z-10 w-full mt-1 bg-gray-800 border border-gray-300 rounded-md shadow-lg flex flex-col max-h-72 overflow-y-auto">
            {tokenAccountsQuery?.data?.map(({ account, pubkey }) => (
              <div
                key={pubkey.toString()}
                className=" py-2 hover:bg-gray-900 cursor-pointer"
                onClick={() => handleMintSelect(account.data.parsed.info.mint)}
              >
                <div className="font-medium">{pubkey.toString()}</div>
                <div className="text-sm text-gray-500">
                  Token Amount: {account.data.parsed.info.tokenAmount.uiAmount}
                </div>
              </div>
            ))}
            <Link
              className="w-full py-2 text-center font-semibold border border-gray-500 rounded-md transition-all hover:bg-gray-700 active:scale-95 md:text-xl"
              href="/createMint"
            >
              + Create New Token Program
            </Link>
          </div>
        )}
      </div>
      <input
        type="text"
        placeholder="Token Amount tobe vested"
        value={tokenAmountTobeVested || ""}
        onChange={(e) => {
          const inputValue = parseInt(e.target.value);
          const selectedMintMaxAmount = tokenAccountsQuery?.data?.find(
            (el) => el.account.data.parsed.info.mint === mint
          )?.account.data.parsed.info.tokenAmount.uiAmount;
          if (inputValue > selectedMintMaxAmount) {
            toast.error(
              `Your current token ${mint.substring(
                0,
                8
              )}... supply is ${selectedMintMaxAmount} ! Please enter less tobe vested !`
            );
            return;
          }
          setTokenAmountTobeVested(inputValue);
        }}
        className="w-full p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-300"
      />
      <button
        className="btn lg:btn-md btn-primary w-full"
        onClick={() =>
          createVestingAccount.mutateAsync({
            companyName,
            tokenAmountTobeVested: new BN(tokenAmountTobeVested * 10 ** 9),
            mint,
          })
        }
        disabled={
          createVestingAccount.isPending ||
          !mint ||
          !companyName ||
          !tokenAmountTobeVested
        }
      >
        {createVestingAccount.isPending ? (
          <Loader width={40} height={40} color="gray-900" />
        ) : (
          "Create"
        )}
      </button>
    </div>
  );
}

export function VestingdappList() {
  const { getProgramAccount, walletPublicKey } = useCommonProgram();
  const { vestingAccounts } = useVesting();
  if (getProgramAccount.isLoading) {
    return (
      <div className="w-screen h-96 flex justify-center items-center">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }
  if (!getProgramAccount.data?.value) {
    return (
      <div className="alert alert-info flex justify-center mt-24">
        <span>
          Program account not found. Make sure you have deployed the program and
          are on the correct cluster.
        </span>
      </div>
    );
  }
  const userVestingAccounts = vestingAccounts.data?.filter(
    (userAccount) =>
      userAccount.account.owner.toBase58() === walletPublicKey?.toBase58()
  );
  return (
    <div className="flex justify-center flex-col gap-4 mt-14">
      <Link
        href="/createVesting"
        className="mb-8 w-full text-center font-semibold border border-gray-500 rounded-md px-4 py-2 transition-all hover:bg-gray-700 active:scale-95 md:text-xl"
      >
        Create New Vesting Program
      </Link>
      <h2 className="w-full text-center text-lg">Vesting Program List</h2>
      <div className={"space-y-6"}>
        {vestingAccounts.isLoading ? (
          <div className="w-screen h-96 flex justify-center items-center">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        ) : userVestingAccounts?.length && userVestingAccounts.length > 0 ? (
          <div className="flex p-2 gap-4 flex-col overflow-y-auto h-[calc(100vh-340px)]">
            <PerfectScrollbar>
              {userVestingAccounts.map((account) => (
                <VestingdappCard
                  key={account.publicKey.toString()}
                  account={account.publicKey}
                  treasuryTokenAccount={account.account.treasuryTokenAccount}
                />
              ))}
            </PerfectScrollbar>
          </div>
        ) : (
          <div className="text-center">
            <h2 className={"text-2xl"}>No Vesting Account</h2>
            No vesting account found. Create one above to get started.
          </div>
        )}
      </div>
    </div>
  );
}

function VestingdappCard({
  account,
  treasuryTokenAccount,
}: {
  account: PublicKey;
  treasuryTokenAccount: PublicKey;
}) {
  const { vestingAccountQuery } = useVestingdappProgramAccount({
    account,
  });
  const { availableTokensInAccount, availableTokensInAccountIsLoading } =
    useCompanyEmployees({
      treasuryAccount: treasuryTokenAccount,
    });

  const { createEmployeeAccount } = useCreateEmployeeVesting();
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [endTime, setEndTime] = useState<Date | null>(null);
  const [cliffTime, setCliffTime] = useState<Date | null>(null);
  const [totalAmount, setTotalAmount] = useState(0);
  const [beneficiary, setBeneficiary] = useState("");
  const [vestingAccount, setVestingAccount] = useState(account.toBase58());

  const companyName = useMemo(
    () => vestingAccountQuery.data?.companyName ?? 0,
    [vestingAccountQuery.data?.companyName]
  );
  return vestingAccountQuery.isLoading ? (
    <div className="w-screen h-96 flex justify-center items-center">
      <span className="loading loading-spinner loading-lg"></span>
    </div>
  ) : (
    <div className="card card-bordered border-base-300 border-4 text-neutral-content ">
      <div className="card-body items-center text-center">
        <div className="space-y-6">
          <div className="flex flex-col">
            <h2
              className="card-title justify-center text-3xl cursor-pointer flex flex-col"
              onClick={() => vestingAccountQuery.refetch()}
            >
              <span>{companyName}</span>
              <span className="text-xs text-gray-500">
                <span> Available Tokens :</span>
                {availableTokensInAccountIsLoading ? (
                  <Loader width={10} height={10} color="green-200" />
                ) : (
                  availableTokensInAccount
                )}
              </span>
              <span className="text-xs text-gray-500">
                Vesting Program:{" "}
                <ExplorerLink
                  label={ellipsify(account.toString())}
                  path={`account/${account.toString()}`}
                />
              </span>
            </h2>
          </div>
          <div className="flex justify-center flex-col gap-4">
            <div className=" flex flex-col md:flex-row justify-center gap-4">
              <Flatpickr
                data-enable-time
                value={startTime || ""}
                onChange={(start) => setStartTime(start[0])}
                options={{
                  enableTime: true,
                  dateFormat: "Y-m-d H:i",
                  disableMobile: true,
                }}
                className=" input input-bordered w-full max-w-xs px-2 py-1 "
                placeholder="Vesting Start Time"
              />
              <Flatpickr
                data-enable-time
                value={endTime || ""}
                onChange={(end) => setEndTime(end[0])}
                options={{
                  enableTime: true,
                  dateFormat: "Y-m-d H:i",
                  disableMobile: true,
                }}
                className="input input-bordered w-full max-w-xs px-2 py-1"
                placeholder="Vesting End Time"
              />
              <Flatpickr
                data-enable-time
                value={cliffTime || ""}
                onChange={(cliff) => setCliffTime(cliff[0])}
                options={{
                  enableTime: true,
                  dateFormat: "Y-m-d H:i",
                  disableMobile: true,
                }}
                className=" input input-bordered w-full max-w-xs px-2 py-1"
                placeholder="Vesting Cliff Time"
                type="text"
              />
            </div>
            <div className=" flex flex-col md:flex-row justify-center gap-4">
              <input
                type="text"
                placeholder="Total Allocation"
                value={totalAmount || ""}
                onChange={(e) => {
                  const inputValue = parseInt(e.target.value) || 0;
                  if (inputValue > (availableTokensInAccount || 0)) {
                    toast.error(
                      `You have only ${availableTokensInAccount} no. of tokens tobe vested to employees.`
                    );
                  } else {
                    setTotalAmount(inputValue);
                  }
                }}
                className="input input-bordered w-full max-w-xs"
              />
              <input
                type="text"
                placeholder="Beneficiary wallet Address"
                value={beneficiary || ""}
                onChange={(e) => setBeneficiary(e.target.value)}
                className="input input-bordered w-full max-w-xs"
              />
              <input
                type="text"
                title={`Vesting Account for company  ${companyName}`}
                value={vestingAccount}
                disabled={!!account}
                onChange={(e) => setVestingAccount(e.target.value)}
                className="input input-bordered w-full max-w-xs "
              />
            </div>
            <div className="flex-grow flex justify-center">
              <button
                className="w-[90%] md:w-[50%] btn lg:btn-md btn-outline flex"
                onClick={() => {
                  if (!startTime || !endTime || !cliffTime) {
                    toast.error("Select Time !");
                    return;
                  }
                  createEmployeeAccount.mutateAsync({
                    startTime: new BN(unixTimeStarmp(startTime)),
                    endTime: new BN(unixTimeStarmp(endTime)),
                    totalAmount: new BN(totalAmount),
                    cliffTime: new BN(unixTimeStarmp(cliffTime)),
                    beneficiary: new PublicKey(beneficiary),
                    vestingAccount: account,
                  });
                }}
                disabled={createEmployeeAccount.isPending}
              >
                {createEmployeeAccount.isPending ? (
                  <Loader width={40} height={40} color="gray-900" />
                ) : (
                  "Create Employee Vesting Account"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function EmployeeProgramList() {
  const { employeeAccountsQuery } = useFetchVestedEmployees();

  if (employeeAccountsQuery.isLoading) {
    return (
      <div className="w-screen h-96 flex justify-center items-center">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }
  if (
    !employeeAccountsQuery.isLoading &&
    (!employeeAccountsQuery.data || employeeAccountsQuery.data.length === 0)
  ) {
    return (
      <div className=" flex flex-col justify-center mt-24">
        <Link
          href="/dapptokenvesting"
          className="mb-8 w-full text-center font-semibold border border-gray-500 rounded-md px-4 py-2 transition-all hover:bg-gray-700 active:scale-95 md:text-xl"
        >
          Add Employee to Vesting Program
        </Link>
        <span className="w-full text-center">
          Your dont have any employee vesting accounts.
        </span>
      </div>
    );
  }
  return (
    <div className={"space-y-6"}>
      {employeeAccountsQuery.isLoading ? (
        <div className="w-screen h-96 flex justify-center items-center">
          <span className="loading loading-spinner loading-lg flex justify-center items-center h-96"></span>
        </div>
      ) : employeeAccountsQuery.error ? (
        <span className="text-xl">
          Error occured whicle fetching employee vesting accounts.
        </span>
      ) : employeeAccountsQuery.data ? (
        <div className="max-w-[100vw-200px]">
          <EmployeeProgramCard employeeAccounts={employeeAccountsQuery.data} />
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

export function EmployeeProgramCard({
  employeeAccounts,
}: {
  employeeAccounts: IEmployeeVesting[];
}) {
  return (
    <div className="flex justify-center flex-col gap-4 mt-8">
      {employeeAccounts.length === 0 && (
        <Link
          href="/dapptokenvesting"
          className=" text-center font-semibold border border-gray-500 rounded-md px-4 py-2 transition-all hover:bg-gray-700 active:scale-95 md:text-xl"
        >
          Add Employee to Vesting Account
        </Link>
      )}
      <div className="container mx-auto">
        <div className="md:relative flex flex-col-reverse gap-4">
          <h1 className="text-lg md:text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4 md:mb-12 text-center">
            Employees Vesting Account List
          </h1>
          <Link
            className="md:absolute top-12 right-0 text-center font-semibold rounded-md px-4 py-2 transition-all hover:bg-gray-700 active:scale-95 text-sm"
            href="/dapptokenvesting"
          >
            {window.innerWidth < 1023 || employeeAccounts.length === 1
              ? "+ Add New"
              : "+ Add New Employee"}
          </Link>
        </div>
        {employeeAccounts.length > 0 ? (
          <div className="w-full overflow-y-auto h-[calc(100vh-250px)]">
            <PerfectScrollbar>
              <div
                className={`grid gap-6 w-full ${
                  employeeAccounts.length === 1
                    ? "grid-cols-1 justify-center"
                    : employeeAccounts.length === 2
                    ? "grid-cols-1 md:grid-cols-2 justify-center"
                    : employeeAccounts.length === 3
                    ? "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 justify-center"
                    : "sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                }`}
              >
                {employeeAccounts.map((employeeAccount) => (
                  <div
                    key={employeeAccount.pda}
                    className="w-full bg-gray-800 border border-gray-700 shadow-lg rounded-lg p-3 md:p-6 hover:shadow-xl hover:bg-gray-700 transition-all duration-300"
                  >
                    <div className="mb-2">
                      <h2 className="text-lg font-semibold text-blue-400 mb-2">
                        Employee Account
                      </h2>
                      <p className="text-sm text-gray-300 break-all h-10">
                        {employeeAccount.pda}
                      </p>
                    </div>
                    <div className="mb-2">
                      <h2 className="text-lg font-semibold text-blue-400 mb-2">
                        Employee Wallet
                      </h2>
                      <p className="text-sm text-gray-300 break-all h-10">
                        {employeeAccount.beneficiary}
                      </p>
                    </div>
                    <div className="mb-2">
                      <h2 className="text-lg font-semibold text-blue-400 mb-2">
                        Vesting Account
                      </h2>
                      <p className="text-sm text-gray-300 break-all h-10">
                        {employeeAccount.vestingAccount}
                      </p>
                    </div>
                    <div className="mb-2">
                      <h2 className="text-lg font-semibold text-blue-400 mb-2">
                        Token
                      </h2>
                      <p className="text-sm text-gray-300 break-all h-10">
                        {employeeAccount.token}
                      </p>
                    </div>
                    <div className="mb-2">
                      <h2 className="text-lg font-semibold text-blue-400 mb-2">
                        Treasury Account
                      </h2>
                      <p className="text-sm text-gray-300 break-all h-10">
                        {employeeAccount.treasuryTokenAccount}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <h3 className="text-sm font-semibold text-blue-400">
                          Start
                        </h3>
                        <p className="text-xs text-gray-300">
                          {new Date(
                            employeeAccount.startTime * 1000
                          ).toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-blue-400">
                          Cliff
                        </h3>
                        <p className="text-xs text-gray-300">
                          {new Date(
                            employeeAccount.cliffTime * 1000
                          ).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <h3 className="text-sm font-semibold text-blue-400">
                          End
                        </h3>
                        <p className="text-xs text-gray-300">
                          {new Date(
                            employeeAccount.endTime * 1000
                          ).toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-blue-400">
                          Total
                        </h3>
                        <p className="text-xs text-gray-300">
                          {employeeAccount.totalAmount}
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <h3 className="text-sm font-semibold text-blue-400">
                          company
                        </h3>
                        <p className="text-xs text-gray-300">
                          {employeeAccount.companyName}
                        </p>
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-blue-400">
                          Withdrawn
                        </h3>
                        <p className="text-xs text-gray-300">
                          {employeeAccount.totalWithdrawn}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </PerfectScrollbar>
          </div>
        ) : (
          <p className="text-gray-600 text-center">
            No employee vesting accounts found.
          </p>
        )}
      </div>
    </div>
  );
}
