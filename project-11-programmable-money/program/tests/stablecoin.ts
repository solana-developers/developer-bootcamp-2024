import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Stablecoin } from "../target/types/stablecoin";
import { PythSolanaReceiver } from "@pythnetwork/pyth-solana-receiver";

describe("stablecoin", () => {
  const provider = anchor.AnchorProvider.env();
  const connection = provider.connection;
  const wallet = provider.wallet as anchor.Wallet;
  anchor.setProvider(provider);

  const program = anchor.workspace.Stablecoin as Program<Stablecoin>;

  const pythSolanaReceiver = new PythSolanaReceiver({ connection, wallet });
  const SOL_PRICE_FEED_ID =
    "0xef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d";
  const solUsdPriceFeedAccount = pythSolanaReceiver
    .getPriceFeedAccountAddress(0, SOL_PRICE_FEED_ID)
    .toBase58();

  console.log(solUsdPriceFeedAccount);

  const [collateralAccount] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("collateral"), wallet.publicKey.toBuffer()],
    program.programId
  );

  it("Is initialized!", async () => {
    const tx = await program.methods
      .initializeConfig()
      .accounts({})
      .rpc({ skipPreflight: true, commitment: "confirmed" });
    console.log("Your transaction signature", tx);
  });

  it("Deposit Collateral and Mint USDS", async () => {
    const amountCollateral = 1_000_000_000;
    const amountToMint = 1_000_000_000;
    const tx = await program.methods
      .depositCollateralAndMint(
        new anchor.BN(amountCollateral),
        new anchor.BN(amountToMint)
      )
      .accounts({ priceUpdate: solUsdPriceFeedAccount })
      .rpc({ skipPreflight: true, commitment: "confirmed" });
    console.log("Your transaction signature", tx);
  });

  it("Redeem Collateral and Burn USDS", async () => {
    const amountCollateral = 500_000_000;
    const amountToBurn = 500_000_000;
    const tx = await program.methods
      .redeemCollateralAndBurnTokens(
        new anchor.BN(amountCollateral),
        new anchor.BN(amountToBurn)
      )
      .accounts({ priceUpdate: solUsdPriceFeedAccount })
      .rpc({ skipPreflight: true, commitment: "confirmed" });
    console.log("Your transaction signature", tx);
  });

  // Increase minimum health threshold to test liquidate
  it("Update Config", async () => {
    const tx = await program.methods
      .updateConfig(new anchor.BN(100))
      .accounts({})
      .rpc({ skipPreflight: true, commitment: "confirmed" });
    console.log("Your transaction signature", tx);
  });

  it("Liquidate", async () => {
    const amountToBurn = 500_000_000;
    const tx = await program.methods
      .liquidate(new anchor.BN(amountToBurn))
      .accounts({ collateralAccount, priceUpdate: solUsdPriceFeedAccount })
      .rpc({ skipPreflight: true, commitment: "confirmed" });
    console.log("Your transaction signature", tx);
  });

  it("Update Config", async () => {
    const tx = await program.methods
      .updateConfig(new anchor.BN(1))
      .accounts({})
      .rpc({ skipPreflight: true, commitment: "confirmed" });
    console.log("Your transaction signature", tx);
  });
});
