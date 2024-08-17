import * as anchor from "@coral-xyz/anchor";
import * as sb from "@switchboard-xyz/on-demand";
import { Program } from "@coral-xyz/anchor";
import { TokenLottery } from "../target/types/token_lottery";
import { TOKEN_PROGRAM_ID } from "@coral-xyz/anchor/dist/cjs/utils/token";
import { getAssociatedTokenAddressSync } from "@solana/spl-token";


describe("token-lottery", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  const connection = provider.connection;
  const wallet = provider.wallet as anchor.Wallet;
  anchor.setProvider(provider);

  const program = anchor.workspace.TokenLottery as Program<TokenLottery>;
  let switchboardProgram;
  const rngKp = anchor.web3.Keypair.generate();

  const TOKEN_METADATA_PROGRAM_ID = new anchor.web3.PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s');

  before("Loading switchboard program", async () => {
    const switchboardIDL = await anchor.Program.fetchIdl(
      sb.SB_ON_DEMAND_PID, 
      {connection: new anchor.web3.Connection("https://mainnet.helius-rpc.com/?api-key=792d0c03-a2b0-469e-b4ad-1c3f2308158c")}
    );
    switchboardProgram = new anchor.Program(switchboardIDL, provider);
  });

  async function buyTicket() {
    const buyTicketIx = await program.methods.buyTicket()
      .accounts({
      tokenProgram: TOKEN_PROGRAM_ID,
    })
    .instruction();

    const blockhashContext = await connection.getLatestBlockhash();

    const computeIx = anchor.web3.ComputeBudgetProgram.setComputeUnitLimit({
     units: 300000
    });

    const priorityIx = anchor.web3.ComputeBudgetProgram.setComputeUnitPrice({
      microLamports: 1
    });

    const tx = new anchor.web3.Transaction({
      blockhash: blockhashContext.blockhash,
      lastValidBlockHeight: blockhashContext.lastValidBlockHeight,
      feePayer: wallet.payer.publicKey,
    }).add(buyTicketIx)
      .add(computeIx)
      .add(priorityIx);

    const sig = await anchor.web3.sendAndConfirmTransaction(connection, tx, [wallet.payer]);
    console.log("buy ticket ", sig);
  }

  it("Is initialized!", async () => {

    const slot = await connection.getSlot();
    console.log("Current slot", slot);

    const mint = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from('collection_mint')],
      program.programId,
    )[0];

    const metadata = anchor.web3.PublicKey.findProgramAddressSync(
        [Buffer.from('metadata'), TOKEN_METADATA_PROGRAM_ID.toBuffer(), mint.toBuffer()],
        TOKEN_METADATA_PROGRAM_ID,
      )[0];
  
    const masterEdition = anchor.web3.PublicKey.findProgramAddressSync(
        [Buffer.from('metadata'), TOKEN_METADATA_PROGRAM_ID.toBuffer(), mint.toBuffer(), Buffer.from('edition')],
        TOKEN_METADATA_PROGRAM_ID,
      )[0];

    const initConfigIx = await program.methods.initializeConfig(
      new anchor.BN(0),
      new anchor.BN(slot + 10),
      new anchor.BN(10000),
    ).instruction();

    const initLotteryIx = await program.methods.initializeLottery()
      .accounts({
      masterEdition: masterEdition,
      metadata: metadata,
      tokenProgram: TOKEN_PROGRAM_ID,
    })
    .instruction();

    const blockhashContext = await connection.getLatestBlockhash();

    const tx = new anchor.web3.Transaction({
      blockhash: blockhashContext.blockhash,
      lastValidBlockHeight: blockhashContext.lastValidBlockHeight,
      feePayer: wallet.payer.publicKey,
    }).add(initConfigIx)
      .add(initLotteryIx);

    const sig = await anchor.web3.sendAndConfirmTransaction(connection, tx, [wallet.payer]);
    console.log(sig);
  });

  it("Is buying tickets!", async () => {
    await buyTicket();
    await buyTicket();
    await buyTicket();
    await buyTicket();
    await buyTicket();
  });

  it("Is committing and revealing a winner", async () => {
    const queue = new anchor.web3.PublicKey("A43DyUGA7s8eXPxqEjJY6EBu1KKbNgfxF8h17VAHn13w");

    const queueAccount = new sb.Queue(switchboardProgram, queue);
    console.log("Queue account", queue.toString());
    try {
      await queueAccount.loadData();
    } catch (err) {
      console.log("Queue account not found");
      process.exit(1);
    }

    const [randomness, ix] = await sb.Randomness.create(switchboardProgram, rngKp, queue);
    console.log("Created randomness account..");
    console.log("Randomness account", randomness.pubkey.toBase58());
    console.log("rkp account", rngKp.publicKey.toBase58());
    const createRandomnessTx = await sb.asV0Tx({
      connection: connection,
      ixs: [ix],
      payer: wallet.publicKey,
      signers: [wallet.payer, rngKp],
      computeUnitPrice: 75_000,
      computeUnitLimitMultiple: 1.3,
    });

    const blockhashContext = await connection.getLatestBlockhashAndContext();
  
    const createRandomnessSignature = await connection.sendTransaction(createRandomnessTx);
    await connection.confirmTransaction({
      signature: createRandomnessSignature,
      blockhash: blockhashContext.value.blockhash,
      lastValidBlockHeight: blockhashContext.value.lastValidBlockHeight
    });
    console.log(
      "Transaction Signature for randomness account creation: ",
      createRandomnessSignature
    );

    const sbCommitIx = await randomness.commitIx(queue);

    const commitIx = await program.methods.commitAWinner()
      .accounts(
        {
          randomnessAccountData: randomness.pubkey
        }
      )
      .instruction();

    const commitTx = await sb.asV0Tx({
      connection: switchboardProgram.provider.connection,
      ixs: [sbCommitIx, commitIx],
      payer: wallet.publicKey,
      signers: [wallet.payer],
      computeUnitPrice: 75_000,
      computeUnitLimitMultiple: 1.3,
    });

    const commitSignature = await connection.sendTransaction(commitTx);
    await connection.confirmTransaction({
      signature: commitSignature,
      blockhash: blockhashContext.value.blockhash,
      lastValidBlockHeight: blockhashContext.value.lastValidBlockHeight
    });
    console.log(
      "Transaction Signature for commit: ",
      commitSignature
    );

    const sbRevealIx = await randomness.revealIx();
    const revealIx = await program.methods.chooseAWinner()
      .accounts({
        randomnessAccountData: randomness.pubkey
      })
      .instruction();
    

    const revealTx = await sb.asV0Tx({
      connection: switchboardProgram.provider.connection,
      ixs: [sbRevealIx, revealIx],
      payer: wallet.publicKey,
      signers: [wallet.payer],
      computeUnitPrice: 75_000,
      computeUnitLimitMultiple: 1.3,
    });

    const revealSignature = await connection.sendTransaction(revealTx);
    await connection.confirmTransaction({
      signature: commitSignature,
      blockhash: blockhashContext.value.blockhash,
      lastValidBlockHeight: blockhashContext.value.lastValidBlockHeight
    });
    console.log("  Transaction Signature revealTx", revealSignature);
  });

  it("Is claiming a prize", async () => {
    const tokenLotteryAddress = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from('token_lottery')],
      program.programId,
    )[0];
    const lotteryConfig = await program.account.tokenLottery.fetch(tokenLotteryAddress);
    console.log("Lottery winner", lotteryConfig.winner);
    console.log("Lottery config", lotteryConfig);


    const tokenAccounts = await connection.getParsedTokenAccountsByOwner(wallet.publicKey, {programId: TOKEN_PROGRAM_ID});
    tokenAccounts.value.forEach(async (account) => {
      console.log("Token account mint", account.account.data.parsed.info.mint);
      console.log("Token account address", account.pubkey.toBase58());
    });

    const winningMint = anchor.web3.PublicKey.findProgramAddressSync(
      [new anchor.BN(lotteryConfig.winner).toArrayLike(Buffer, 'le', 8)],
      program.programId,
    )[0];
    console.log("Winning mint", winningMint.toBase58());

    const winningTokenAddress = getAssociatedTokenAddressSync(
      winningMint,
      wallet.publicKey
    );
    console.log("Winning token address", winningTokenAddress.toBase58());

    const claimIx = await program.methods.claimPrize()
      .accounts({
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .instruction();

    const blockhashContext = await connection.getLatestBlockhash();

    const claimTx = new anchor.web3.Transaction({
      blockhash: blockhashContext.blockhash,
      lastValidBlockHeight: blockhashContext.lastValidBlockHeight,
      feePayer: wallet.payer.publicKey,
    }).add(claimIx);

    const claimSig = await anchor.web3.sendAndConfirmTransaction(connection, claimTx, [wallet.payer]);
    console.log(claimSig);

  });

});
