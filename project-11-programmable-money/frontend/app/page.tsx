"use client";

import DepositAndWithdraw from "@/components/stablecoin/deposit-withdraw";
import CollateralAccountDisplay from "@/components/stablecoin/collateral";

export default function DepositWithdrawPage() {
  return (
    <div className="mt-5 flex items-start justify-center space-x-4">
      <DepositAndWithdraw />
      <CollateralAccountDisplay />
    </div>
  );
}
