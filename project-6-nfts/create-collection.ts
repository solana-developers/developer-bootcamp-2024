// Import necessary functions and types from various libraries
import { 
    createNft, 
    fetchDigitalAsset, 
    mplTokenMetadata,
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
    generateSigner, 
    percentAmount,
    keypairIdentity,
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
    "🔑 Loaded user", user.publicKey.toBase58()
);

// 2. Set up Umi
// Create a Umi instance and configure it
const umi = createUmi(connection.rpcEndpoint);
umi.use(mplTokenMetadata());

// Set up the Umi instance with the user's identity
const umiUser = umi.eddsa.createKeypairFromSecretKey(user.secretKey);
umi.use(keypairIdentity(umiUser));

console.log("🛠️ Set up Umi instance for user");

// 3. Prepare collection creation
// Generate a new signer for the collection mint
const collectionMint = generateSigner(umi);

console.log("🎨 Creating NFT collection...");

// 4. Create and send transaction
// Create the NFT collection
const transaction = await createNft(
    umi,
    {
        mint: collectionMint,
        name: "My Collection",
        symbol: "MC",
        uri: "https://raw.githubusercontent.com/solana-developers/professional-education/main/labs/sample-token-metadata.json",
        sellerFeeBasisPoints: percentAmount(0),
        isCollection: true,
    }
)

// Send and confirm the transaction
await transaction.sendAndConfirm(umi);

// 5. Fetch and display created collection
// Fetch the created collection NFT
const createdCollectionNft = await fetchDigitalAsset(
    umi,
    collectionMint.publicKey,
);

// Log the explorer link for the created collection NFT
console.log(
    `🎉 Collection NFT created: ${getExplorerLink(
        "address",
        createdCollectionNft.mint.publicKey,
        "devnet"
    )}`
);
