// Import necessary functions and types from various libraries
import { 
    findMetadataPda, 
    mplTokenMetadata,
    verifyCollectionV1,
} from "@metaplex-foundation/mpl-token-metadata";

import {
    airdropIfRequired,
    getExplorerLink,
    getKeypairFromFile,
} from "@solana-developers/helpers";

import {
    createUmi,
} from "@metaplex-foundation/umi-bundle-defaults"

import { 
    keypairIdentity,
    publicKey,
} from "@metaplex-foundation/umi";

import {
    Connection,
    LAMPORTS_PER_SOL,
} from "@solana/web3.js";

// 1. Set up connection and user
// Create a connection to the Solana devnet
const connection = new Connection(
    "https://api.devnet.solana.com",
    "confirmed"
);

// Load the user's keypair from a file
const user = await getKeypairFromFile();

// Airdrop SOL to the user if their balance is below 0.5 SOL
await airdropIfRequired(connection, user.publicKey, 1 * LAMPORTS_PER_SOL, 0.5 * LAMPORTS_PER_SOL);

console.log(
    "🔑 Loaded user:", user.publicKey.toBase58()
);

// 2. Set up Umi
// Create a Umi instance and configure it
const umi = createUmi(connection.rpcEndpoint);
umi.use(mplTokenMetadata());

// Set up the Umi instance with the user's identity
const umiUser = umi.eddsa.createKeypairFromSecretKey(user.secretKey);
umi.use(keypairIdentity(umiUser));

console.log("🛠️ Set up Umi instance for user");

// 3. Define collection and NFT addresses
const collectionAddress = publicKey("GuGvYWW8bqAumbvSfV5TMBzZZf92kTfyfVM9Vnbj8gLZ");
const nftAddress = publicKey("HbgnPx9pZj5Ts6QWJNL1ynmL1pu3MH73kcm4mMKkmsb9");

console.log("🔍 Verifying NFT...");

// 4. Create and send the verification transaction
const transaction = await verifyCollectionV1(umi, {
    metadata: findMetadataPda(umi, { mint: nftAddress }),
    collectionMint: collectionAddress,
    authority: umi.identity
});

await transaction.sendAndConfirm(umi);

console.log(`✅ NFT ${nftAddress} verified as a member of collection ${collectionAddress}!`);
console.log(`🔗 See Explorer: ${getExplorerLink("address", nftAddress, "devnet")}`);
