"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { WalletButton } from "../solana/solana-provider";
import { AppHero, ellipsify } from "../ui/ui-layout";
import { ExplorerLink } from "../cluster/cluster-ui";
import { MemeTokenCreate, MemeTokenList } from "./meme-ui";
import { useCommonProgram } from "../common/common-data-access";
import { usePathname } from "next/navigation";

export default function TokenMemeFeature() {
  const { publicKey } = useWallet();
  const { programId } = useCommonProgram();
  const pathName = usePathname();

  return publicKey ? (
    <div>
      {pathName === "/createMint" && (
        <AppHero
          title="Token Program"
          subtitle={
            "Create a new Token, its associated token account and token amount just by adding initial token amout"
          }
        >
          <p className="mb-6">
            <ExplorerLink
              path={`account/${programId}`}
              label={ellipsify(programId.toString())}
            />
          </p>
          <MemeTokenCreate publicKey={publicKey} />
        </AppHero>
      )}
      {pathName === "/mint" && <MemeTokenList publicKey={publicKey} />}
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
