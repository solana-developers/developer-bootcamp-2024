'use client';

import { ellipsify } from '../ui/ui-layout';
import { ExplorerLink } from '../cluster/cluster-ui';
import {
  useVotingProgram,
  useVotingProgramCandidateAccount,
} from './voting-data-access';
import { useEffect, useMemo, useState } from 'react';
import { PublicKey } from '@solana/web3.js';


export function CandidateList() {
  const { candidates, getProgramAccount } = useVotingProgram();

  if (getProgramAccount.isLoading) {
    return <span className="loading loading-spinner loading-lg"></span>;
  }

  return (
    <div>
      {candidates.isLoading ? (
        <span className="loading loading-spinner loading-lg"></span>
      ) : candidates.data?.length ? (
        <div className="grid md:grid-cols-2 gap-4">
          {candidates.data?.map((account) => (
            <div key={account.publicKey.toString()}>
              <CandidateCard
                key={account.publicKey.toString()}
                votes={account.account.candidateVotes}
                name={account.account.candidateName}
                account={account.publicKey}
              />
              </div>
          ))}
        </div>
      ) : (
        <div className="text-center">
          <h2 className={'text-2xl'}>No accounts</h2>
          No accounts found. Create one above to get started.
        </div>
      )}
    </div>
  )
}

function CandidateCard({ account }: 
  { votes: number, name: string, account: PublicKey }) {
  const {
    candidateQuery,
    vote,
  } = useVotingProgramCandidateAccount({ account });

  const [name, setName] = useState('');
  const [votes, setVotes] = useState(0);

  useEffect(() => {
    if (candidateQuery.data) {
      setName(candidateQuery.data.candidateName ?? '');
      setVotes(candidateQuery.data.candidateVotes ?? 0);
    }
  }, [candidateQuery.data]);
  
  return (
    <div className="card card-bordered border-base-300 border-4 text-neutral-content">
      <div className="card-body items-center text-center">
        <div className="space-y-6">
          <h2
            className="card-title justify-center text-3xl cursor-pointer"
            onClick={() => candidateQuery.refetch()}
          >
            {name}
          </h2>
          <p>{votes.toString()} votes</p>
          <button
              className="btn btn-xs lg:btn-md btn-outline"
              onClick={() => vote.mutateAsync(name)}
              disabled={vote.isPending}
            >
              Vote
            </button>
        </div>
      </div>
    </div>
  );
}

/*export function VotingList() {
  const { accounts, getProgramAccount } = useVotingProgram();

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
    <div className={'space-y-6'}>
      {accounts.isLoading ? (
        <span className="loading loading-spinner loading-lg"></span>
      ) : accounts.data?.length ? (
        <div className="grid md:grid-cols-2 gap-4">
          {accounts.data?.map((account) => (
            <VotingCard
              key={account.publicKey.toString()}
              account={account.publicKey}
            />
          ))}
        </div>
      ) : (
        <div className="text-center">
          <h2 className={'text-2xl'}>No accounts</h2>
          No accounts found. Create one above to get started.
        </div>
      )}
    </div>
  );
}

/*function VotingCard({ account }: { account: PublicKey }) {
  const {
    accountQuery,
    incrementMutation,
    setMutation,
    decrementMutation,
    closeMutation,
  } = useVotingProgram({ account });

  const count = useMemo(
    () => accountQuery.data?.count ?? 0,
    [accountQuery.data?.count]
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
            {count}
          </h2>
          <div className="card-actions justify-around">
            <button
              className="btn btn-xs lg:btn-md btn-outline"
              onClick={() => incrementMutation.mutateAsync()}
              disabled={incrementMutation.isPending}
            >
              Increment
            </button>
            <button
              className="btn btn-xs lg:btn-md btn-outline"
              onClick={() => {
                const value = window.prompt(
                  'Set value to:',
                  count.toString() ?? '0'
                );
                if (
                  !value ||
                  parseInt(value) === count ||
                  isNaN(parseInt(value))
                ) {
                  return;
                }
                return setMutation.mutateAsync(parseInt(value));
              }}
              disabled={setMutation.isPending}
            >
              Set
            </button>
            <button
              className="btn btn-xs lg:btn-md btn-outline"
              onClick={() => decrementMutation.mutateAsync()}
              disabled={decrementMutation.isPending}
            >
              Decrement
            </button>
          </div>
          <div className="text-center space-y-4">
            <p>
              <ExplorerLink
                path={`account/${account}`}
                label={ellipsify(account.toString())}
              />
            </p>
            <button
              className="btn btn-xs btn-secondary btn-outline"
              onClick={() => {
                if (
                  !window.confirm(
                    'Are you sure you want to close this account?'
                  )
                ) {
                  return;
                }
                return closeMutation.mutateAsync();
              }}
              disabled={closeMutation.isPending}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}*/
