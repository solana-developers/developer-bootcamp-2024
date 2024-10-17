// Import necessary functions and types from various libraries
import { 
    createNft, 
    fetchDigitalAsset , 
    mplTokenMetadata,
} from "@metaplex-foundation/mpl-token-metadata";

import{
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
    publicKey,
} from "@metaplex-foundation/umi";

import {
    Connection,
    LAMPORTS_PER_SOL,
} from "@solana/web3.js";

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

// Create a Umi instance and configure it
const umi = createUmi(connection.rpcEndpoint);
umi.use(mplTokenMetadata());

// Set up the Umi instance with the user's identity
const umiUser = umi.eddsa.createKeypairFromSecretKey(user.secretKey);
umi.use(keypairIdentity(umiUser));

console.log("🛠️ Set up Umi instance for user");

const collectionAddress = publicKey("GuGvYWW8bqAumbvSfV5TMBzZZf92kTfyfVM9Vnbj8gLZ");
console.log("creating nft...");

const mint = generateSigner(umi);

const transaction = await createNft(
    umi,
    {
        mint,
        name: "My NFT",
        uri: "https://raw.githubusercontent.com/solana-developers/professional-education/main/labs/sample-token-metadata.json",
        sellerFeeBasisPoints: percentAmount(0),
        collection: {
            key: collectionAddress,
            verified: false,
        },
    }
);

await transaction.sendAndConfirm(umi);

const createdNft = await fetchDigitalAsset(
    umi,
    mint.publicKey,
);

console.log(
    `🎉 Success! Check out your NFT at: ${getExplorerLink(
        "address",
        createdNft.publicKey.toString(),
        "devnet"
    )}`
);