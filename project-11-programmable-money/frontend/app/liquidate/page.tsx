"use client";

import CollateralAccountsTable from "@/components/stablecoin/collateral-table";

export default function LiquidatePage() {
  return (
    <div className="mt-5 flex items-center justify-center">
      <CollateralAccountsTable />
    </div>
  );
}
