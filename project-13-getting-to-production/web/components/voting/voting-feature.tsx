'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { WalletButton } from '../solana/solana-provider';
import { AppHero, ellipsify } from '../ui/ui-layout';
import { ExplorerLink } from '../cluster/cluster-ui';
import { useVotingProgram } from './voting-data-access';
import { CandidateList, VotingCreate } from './voting-ui';

export default function VotingFeature() {
  const { publicKey } = useWallet();
  const { programId } = useVotingProgram();

  return publicKey ? (
    <div>
      <AppHero
        title="Voting Application"
        subtitle={
          'A simple voting application on Solana'
        }
      >
      
      </AppHero>
      <CandidateList />
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
