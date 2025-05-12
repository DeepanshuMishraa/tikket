import { createProgrammableNft, mplTokenMetadata } from "@metaplex-foundation/mpl-token-metadata";
import {
  createGenericFile,
  generateSigner,
  percentAmount,
  keypairIdentity,
} from "@metaplex-foundation/umi";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { irysUploader } from "@metaplex-foundation/umi-uploader-irys";
import fs from "fs";
import { Keypair, Connection, clusterApiUrl, LAMPORTS_PER_SOL } from "@solana/web3.js";

interface EventMetadata {
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  location: string;
  eventId: string;
}

export const createNFT = async (
  eventMetadata: EventMetadata,
  imagePath: string
) => {
  try {
    // Initialize connection and get airdrop
    const connection = new Connection(clusterApiUrl("devnet"));
    const mintKeypair = Keypair.generate();

    // Request multiple airdrops to ensure enough SOL
    try {
      for(let i = 0; i < 3; i++) {
        const airdropSignature = await connection.requestAirdrop(
          mintKeypair.publicKey,
          LAMPORTS_PER_SOL
        );
        await connection.confirmTransaction(airdropSignature);
      }
    } catch (error) {
      console.error("Error getting airdrop:", error);
      // Continue even if airdrop fails
    }

    // Initialize UMI with fallback uploader URLs
    const umi = createUmi("https://api.devnet.solana.com")
      .use(mplTokenMetadata())
      .use(irysUploader({ 
        address: "https://node1.irys.xyz",
        timeout: 20000,
        retries: 3,
        fallbackAddresses: [
          "https://node2.irys.xyz",
          "https://uploader.irys.xyz",
          "https://devnet.irys.xyz"
        ]
      }));

    const keypair = umi.eddsa.createKeypairFromSecretKey(mintKeypair.secretKey);
    umi.use(keypairIdentity(keypair));

    // Verify image exists
    if (!fs.existsSync(imagePath)) {
      throw new Error(`Image file not found at path: ${imagePath}`);
    }

    // Create metadata first
    const metadata = {
      name: `${eventMetadata.title} - Event Ticket`,
      symbol: 'TICKET',
      description: `Event Ticket for ${eventMetadata.title}\n\nDescription: ${eventMetadata.description}\nDate: ${eventMetadata.startDate.toLocaleDateString()} - ${eventMetadata.endDate.toLocaleDateString()}\nLocation: ${eventMetadata.location}\nEvent ID: ${eventMetadata.eventId}`,
      attributes: [
        { trait_type: 'Event ID', value: eventMetadata.eventId },
        { trait_type: 'Start Date', value: eventMetadata.startDate.toISOString() },
        { trait_type: 'End Date', value: eventMetadata.endDate.toISOString() },
        { trait_type: 'Location', value: eventMetadata.location },
      ],
    };

    // Try to upload metadata first
    console.log("Uploading metadata...");
    const metadataFile = createGenericFile(
      Buffer.from(JSON.stringify(metadata)),
      'metadata.json',
      { contentType: 'application/json' }
    );

    let metadataUri;
    try {
      [metadataUri] = await umi.uploader.upload([metadataFile]);
      console.log("Metadata uploaded successfully:", metadataUri);
    } catch (error) {
      console.error("Failed to upload metadata, using fallback method");
      // You could implement a fallback method here
      throw error;
    }

    // Try to upload image
    console.log("Uploading image...");
    const imageBuffer = fs.readFileSync(imagePath);
    const imageFile = createGenericFile(imageBuffer, 'nf.png', {
      contentType: 'image/png',
    });

    let imageUri;
    try {
      [imageUri] = await umi.uploader.upload([imageFile]);
      console.log("Image uploaded successfully:", imageUri);
      
      // Update metadata with image URI
      metadata.image = imageUri;
    } catch (error) {
      console.error("Failed to upload image, using fallback method");
      // You could use a default image URI here
      metadata.image = "https://your-default-image-url.com/default.png";
    }

    // Create NFT
    console.log("Creating NFT...");
    const mint = generateSigner(umi);
    
    try {
      await createProgrammableNft(umi, {
        mint,
        name: metadata.name,
        symbol: metadata.symbol,
        uri: metadataUri,
        sellerFeeBasisPoints: percentAmount(0),
      }).sendAndConfirm(umi);

      console.log("NFT created successfully!");

      return {
        mint: mint.publicKey,
        metadata: metadataUri,
        explorerLink: `https://explorer.solana.com/address/${mint.publicKey}?cluster=devnet`,
      };
    } catch (error) {
      console.error("Failed to create NFT:", error);
      throw new Error("Failed to create NFT. Please try again.");
    }
  } catch (error) {
    console.error('Error in createNFT:', error);
    throw new Error("Failed to create NFT. Please try again later.");
  }
}
