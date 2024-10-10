import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { BankOne } from "../target/types/bank_one";
import { assert } from "chai";

describe("bank_one", () => {
  const provider = anchor.AnchorProvider.env();
  const connection = provider.connection;
  const wallet = provider.wallet as anchor.Wallet;
  anchor.setProvider(provider);

  const program = anchor.workspace.BankOne as Program<BankOne>;

  const authority = new anchor.web3.Keypair();
  const amount = 1_000_000; // 1million lamports

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

  it("Deposit", async () => {
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

  it("Withdraw", async () => {
    const walletInitialBalance = await connection.getBalance(wallet.publicKey);

    const depositInstruction = await program.methods
      .deposit(new anchor.BN(0))
      .accounts({ authority: wallet.publicKey })
      .instruction();

    const withdrawInstruction = await program.methods
      .withdraw(new anchor.BN(amount))
      .accounts({ authority: wallet.publicKey })
      .instruction();

    const transaction = new anchor.web3.Transaction().add(
      depositInstruction,
      withdrawInstruction
    );

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
