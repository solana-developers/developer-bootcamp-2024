import * as anchor from '@coral-xyz/anchor'
import {Program} from '@coral-xyz/anchor'
import {Keypair} from '@solana/web3.js'
import {Dapptokenvesting} from '../target/types/dapptokenvesting'

describe('dapptokenvesting', () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env()
  anchor.setProvider(provider)
  const payer = provider.wallet as anchor.Wallet

  const program = anchor.workspace.Dapptokenvesting as Program<Dapptokenvesting>

  const dapptokenvestingKeypair = Keypair.generate()

  it('Initialize Dapptokenvesting', async () => {
    await program.methods
      .initialize()
      .accounts({
        dapptokenvesting: dapptokenvestingKeypair.publicKey,
        payer: payer.publicKey,
      })
      .signers([dapptokenvestingKeypair])
      .rpc()

    const currentCount = await program.account.dapptokenvesting.fetch(dapptokenvestingKeypair.publicKey)

    expect(currentCount.count).toEqual(0)
  })

  it('Increment Dapptokenvesting', async () => {
    await program.methods.increment().accounts({ dapptokenvesting: dapptokenvestingKeypair.publicKey }).rpc()

    const currentCount = await program.account.dapptokenvesting.fetch(dapptokenvestingKeypair.publicKey)

    expect(currentCount.count).toEqual(1)
  })

  it('Increment Dapptokenvesting Again', async () => {
    await program.methods.increment().accounts({ dapptokenvesting: dapptokenvestingKeypair.publicKey }).rpc()

    const currentCount = await program.account.dapptokenvesting.fetch(dapptokenvestingKeypair.publicKey)

    expect(currentCount.count).toEqual(2)
  })

  it('Decrement Dapptokenvesting', async () => {
    await program.methods.decrement().accounts({ dapptokenvesting: dapptokenvestingKeypair.publicKey }).rpc()

    const currentCount = await program.account.dapptokenvesting.fetch(dapptokenvestingKeypair.publicKey)

    expect(currentCount.count).toEqual(1)
  })

  it('Set dapptokenvesting value', async () => {
    await program.methods.set(42).accounts({ dapptokenvesting: dapptokenvestingKeypair.publicKey }).rpc()

    const currentCount = await program.account.dapptokenvesting.fetch(dapptokenvestingKeypair.publicKey)

    expect(currentCount.count).toEqual(42)
  })

  it('Set close the dapptokenvesting account', async () => {
    await program.methods
      .close()
      .accounts({
        payer: payer.publicKey,
        dapptokenvesting: dapptokenvestingKeypair.publicKey,
      })
      .rpc()

    // The account should no longer exist, returning null.
    const userAccount = await program.account.dapptokenvesting.fetchNullable(dapptokenvestingKeypair.publicKey)
    expect(userAccount).toBeNull()
  })
})
