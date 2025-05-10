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
    const connection = new Connection(clusterApiUrl("devnet"));
    const mintKeypair = Keypair.generate();

    const airdropSignature = await connection.requestAirdrop(
      mintKeypair.publicKey,
      LAMPORTS_PER_SOL
    );
    await connection.confirmTransaction(airdropSignature);

    const umi = createUmi("https://api.devnet.solana.com")
      .use(mplTokenMetadata())
      .use(irysUploader({ address: "https://devnet.irys.xyz" }));

    const keypair = umi.eddsa.createKeypairFromSecretKey(mintKeypair.secretKey);
    umi.use(keypairIdentity(keypair));

    if (!fs.existsSync(imagePath)) {
      throw new Error(`Image file not found at path: ${imagePath}`);
    }

    const imageBuffer = fs.readFileSync(imagePath);
    const imageFile = createGenericFile(imageBuffer, 'nf.png', {
      contentType: 'image/png',
    });

    console.log("Uploading image...");
    const [imageUri] = await umi.uploader.upload([imageFile]);
    console.log("Image uploaded successfully:", imageUri);

    const metadata = {
      name: `${eventMetadata.title} - Event Ticket`,
      symbol: 'TICKET',
      description: `Event Ticket for ${eventMetadata.title}\n\nDescription: ${eventMetadata.description}\nDate: ${eventMetadata.startDate.toLocaleDateString()} - ${eventMetadata.endDate.toLocaleDateString()}\nLocation: ${eventMetadata.location}\nEvent ID: ${eventMetadata.eventId}`,
      image: imageUri,
      attributes: [
        { trait_type: 'Event ID', value: eventMetadata.eventId },
        { trait_type: 'Start Date', value: eventMetadata.startDate.toISOString() },
        { trait_type: 'End Date', value: eventMetadata.endDate.toISOString() },
        { trait_type: 'Location', value: eventMetadata.location },
      ],
    };

    console.log("Uploading metadata...");
    const metadataFile = createGenericFile(
      Buffer.from(JSON.stringify(metadata)),
      'metadata.json',
      { contentType: 'application/json' }
    );

    const [metadataUri] = await umi.uploader.upload([metadataFile]);
    console.log("Metadata uploaded successfully:", metadataUri);

    const mint = generateSigner(umi);
    console.log("Creating NFT...");
    
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
    console.error('Error creating NFT:', error);
    throw error;
  }
}
