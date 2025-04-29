"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { WalletButton } from "../solana/solana-provider";
import { AppHero, ellipsify } from "../ui/ui-layout";
import { ExplorerLink } from "../cluster/cluster-ui";
import {
  EmployeeProgramList,
  VestingdappCreate,
  VestingdappList,
} from "./vestingdapp-ui";
import { useCommonProgram } from "../common/common-data-access";
import { usePathname } from "next/navigation";

export default function VestingdappFeature() {
  const { publicKey } = useWallet();
  const { programId } = useCommonProgram();
  const pathName = usePathname();
  return publicKey ? (
    <div>
      {pathName === "/createVesting" && (
        <AppHero
          title="Vesting Program"
          subtitle={"Create a new vesting account"}
        >
          <p className="mb-6">
            <ExplorerLink
              path={`account/${programId}`}
              label={ellipsify(programId.toString())}
            />
          </p>
          <VestingdappCreate publicKey={publicKey} />
        </AppHero>
      )}
      {pathName === "/dapptokenvesting" && <VestingdappList />}
      {pathName === "/vestedemployees" && <EmployeeProgramList />}
    </div>
  ) : (
    <div className="max-w-4xl mx-auto">
      <div className="hero py-[64px]">
        <div className="hero-content text-center">
          <WalletButton />
        </div>
      </div>
    </div>
  );
}
