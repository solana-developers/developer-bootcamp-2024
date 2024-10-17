import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { BankThree } from "../target/types/bank_three";
import { FakeBank } from "../target/types/fake_bank";
import { assert } from "chai";

describe("bank_three", () => {
  const provider = anchor.AnchorProvider.env();
  const connection = provider.connection;
  const wallet = provider.wallet as anchor.Wallet;
  anchor.setProvider(provider);

  const program = anchor.workspace.BankThree as Program<BankThree>;
  const programFakeBank = anchor.workspace.FakeBank as Program<FakeBank>;

  const authority = new anchor.web3.Keypair();
  const amount = 1_000_000; // 1million lamports

  const [vault] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("vault")],
    program.programId
  );

  const [fakeBank] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("bank")],
    programFakeBank.programId
  );

  before(async () => {
    const transferAmount = 1 * anchor.web3.LAMPORTS_PER_SOL;
    const transferTx = new anchor.web3.Transaction().add(
      anchor.web3.SystemProgram.transfer({
        fromPubkey: wallet.publicKey,
        toPubkey: authority.publicKey,
        lamports: transferAmount,
      })
    );
    await provider.sendAndConfirm(transferTx);
  });

  it("Deposit to Bank", async () => {
    const transaction = await program.methods
      .deposit(new anchor.BN(amount))
      .accounts({ authority: authority.publicKey })
      .transaction();

    const transactionSignature = await anchor.web3.sendAndConfirmTransaction(
      connection,
      transaction,
      [authority],
      { commitment: "confirmed" }
    );
    console.log("Your transaction signature", transactionSignature);
  });

  it("Create Fake Bank", async () => {
    const transaction = await programFakeBank.methods
      .initialize(vault)
      .accounts({ fakeAuthority: wallet.publicKey })
      .transaction();

    const transactionSignature = await anchor.web3.sendAndConfirmTransaction(
      connection,
      transaction,
      [wallet.payer],
      { commitment: "confirmed" }
    );

    console.log("Your transaction signature", transactionSignature);
  });

  it("Withdraw from Bank", async () => {
    const walletInitialBalance = await connection.getBalance(wallet.publicKey, {
      commitment: "confirmed",
    });

    const transaction = await program.methods
      .withdraw(new anchor.BN(amount))
      .accounts({ authority: wallet.publicKey, bank: fakeBank })
      .transaction();

    const transactionSignature = await anchor.web3.sendAndConfirmTransaction(
      connection,
      transaction,
      [wallet.payer],
      { commitment: "confirmed" }
    );

    console.log("Your transaction signature", transactionSignature);

    const walletFinalBalance = await connection.getBalance(wallet.publicKey, {
      commitment: "confirmed",
    });

    assert.equal(walletFinalBalance, walletInitialBalance + amount);
  });
});
