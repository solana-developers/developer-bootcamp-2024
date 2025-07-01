import * as anchor from '@coral-xyz/anchor';
import { Program } from '@coral-xyz/anchor';
import { Voting } from '../target/types/voting';
import { PublicKey } from '@solana/web3.js';

// This is "non-Bankrun" way of writing cases.In this case you must use `solana-test-validator`
// automatically(`anchor test` would do that) or
// manually(run `solana-test-validator` in separate terminal)

describe('Voting', () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.Voting as Program<Voting>;
  console.log("program id: ", program.programId);

  it('initializePoll', async () => {

    const [pollAddress] = PublicKey.findProgramAddressSync(
      [Buffer.from("poll"), new anchor.BN(1).toArrayLike(Buffer, "le", 8)],
      program.programId
    );
    // better to wrap program's instruction calling in case that program doesn't
    // exists in chain and the call just abandons the error
    try {
      const tx = await program.methods.initializePoll(
          new anchor.BN(1),
          new anchor.BN(0),
          new anchor.BN(1759508293),
          "test-poll",
          "description",
      ).rpc();

      console.log('Your transaction signature', tx);
    } catch (e) {
      console.error('initializePoll failed:', e);
    }
  });

  it('initialize candidates', async () => {
    const pollIdBuffer = new anchor.BN(1).toArrayLike(Buffer, "le", 8)

    const [pollAddress] = PublicKey.findProgramAddressSync(
      [Buffer.from("poll"), pollIdBuffer],
      program.programId
    );

    const smoothTx = await program.methods.initializeCandidate(
      new anchor.BN(1), 
      "smooth",
    ).accounts({
      pollAccount: pollAddress
    })
    .rpc();

    const crunchyTx = await program.methods.initializeCandidate(
      new anchor.BN(1), 
      "crunchy",
    ).accounts({
      pollAccount: pollAddress
    })
    .rpc();

    console.log('Your transaction signature', smoothTx);
  });

  it('vote', async () => {

    const tx = await program.methods.vote(
      new anchor.BN(1),
      "smooth",
    )
    .rpc();

    console.log('Your transaction signature', tx);
  });
});
