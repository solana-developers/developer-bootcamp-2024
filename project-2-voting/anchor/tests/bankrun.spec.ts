import { startAnchor } from "solana-bankrun";
import { BankrunProvider } from "anchor-bankrun";
import { PublicKey } from '@solana/web3.js';
import * as anchor from '@coral-xyz/anchor';
import { BN, Program } from "@coral-xyz/anchor";

// This is a "Bankrun" way of writing cases. Bankrun helps manage all the setup stuff
// needed for case to run successfully. It doesn't depend on solana-test-validator, so
// it's more convenient way to do testing.

const IDL = require("../target/idl/voting.json");
import { Voting } from '../target/types/voting';

const PUPPET_PROGRAM_ID = new PublicKey("5s3PtT8kLYCv1WEp6dSh3T7EuF35Z6jSu5Cvx4hWG79H");

describe('Create a system account', () => {

  let context;
  let provider;
  let votingProg;
  let pollAddress;

  beforeAll(async () => {
    console.log("init context,provider,voting program instance ...");
    context = await startAnchor("", [{name: "voting", programId: PUPPET_PROGRAM_ID}], []);
    provider = new BankrunProvider(context);
    votingProg = new Program<Voting>(IDL, provider);
    [pollAddress] = PublicKey.findProgramAddressSync(
      [Buffer.from("poll"), new anchor.BN(1).toArrayLike(Buffer, "le", 8)],
      votingProg.programId
    );
    console.log("program id: ", votingProg.programId);
  })

  test("initialize poll", async () => {
    await votingProg.methods.initializePoll(
      new anchor.BN(1),
        new anchor.BN(0),
        new anchor.BN(1759508293),
        "test-poll",
        "description",
    ).rpc();

    const pollAccount = await votingProg.account.pollAccount.fetch(pollAddress);
    console.log(pollAccount);
    expect(pollAccount.pollOptionIndex.toNumber()).toEqual(0);
    expect(pollAccount.pollDescription).toEqual("description");
    expect(pollAccount.pollVotingStart.toNumber())
      .toBeLessThan(pollAccount.pollVotingEnd.toNumber());
  });

  it("initialize candidate", async() => {
    await votingProg.methods.initializeCandidate(
      new anchor.BN(1),
      "Smooth"
    ).accounts({pollAccount: pollAddress})
     .rpc();

    await votingProg.methods.initializeCandidate(
      new anchor.BN(1),
      "Crunchy"
    ).accounts({pollAccount: pollAddress})
     .rpc();

    const [crunchyAddr] = PublicKey.findProgramAddressSync(
      [new anchor.BN(1).toArrayLike(Buffer, 'le', 8), Buffer.from("Crunchy")],
      votingProg.programId,
    );
    const crunchyData = await votingProg.account.candidateAccount.fetch(crunchyAddr);
    console.log(crunchyData);
    expect(crunchyData.candidateVotes.toNumber()).toEqual(0);

    const pollData = await votingProg.account.pollAccount.fetch(pollAddress);
    expect(pollData.pollOptionIndex.toNumber()).toEqual(2);
  });

  it("vote", async() => {
    await votingProg.methods.vote(
      new anchor.BN(1),
      "Crunchy"
    ).rpc();

    await votingProg.methods.vote(
      new anchor.BN(1),
      "Crunchy"
    ).rpc();
    const [crunchyAddr] = PublicKey.findProgramAddressSync(
      [new anchor.BN(1).toArrayLike(Buffer, 'le', 8), Buffer.from("Crunchy")],
      votingProg.programId,
    );
    const crunchyData = await votingProg.account.candidateAccount.fetch(crunchyAddr);
    expect(crunchyData.candidateVotes.toNumber()).toEqual(2);
  });

});