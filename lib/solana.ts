import { Connection, PublicKey, LAMPORTS_PER_SOL, clusterApiUrl } from '@solana/web3.js';
import { createNft, fetchDigitalAsset, mplTokenMetadata } from "@metaplex-foundation/mpl-token-metadata";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { generateSigner, keypairIdentity, percentAmount } from "@metaplex-foundation/umi";
import { airdropIfRequired, getExplorerLink } from "@solana-developers/helpers";
import { publicKey } from '@metaplex-foundation/umi';

export interface NFTMetadata {
  name: string;
  symbol: string;
  description: string;
  image: string; 
  attributes: Array<{
    trait_type: string;
    value: string;
  }>;
}

export const createEventNFT = async (
  connection: Connection,
  userKeypair: any, // This will be your wallet's keypair
  metadata: NFTMetadata
) => {
  try {
    // Ensure user has enough SOL
    await airdropIfRequired(
      connection,
      new PublicKey(userKeypair.publicKey),
      1 * LAMPORTS_PER_SOL,
      0.5 * LAMPORTS_PER_SOL
    );

    // Initialize UMI
    const umi = createUmi(connection.rpcEndpoint);
    umi.use(mplTokenMetadata());

    // Set up user identity
    const umiUser = umi.eddsa.createKeypairFromSecretKey(userKeypair.secretKey);
    umi.use(keypairIdentity(umiUser));

    // Generate mint signer
    const mintSigner = generateSigner(umi);

    // Create NFT transaction
    const transaction = await createNft(umi, {
      mint: mintSigner,
      name: metadata.name,
      symbol: metadata.symbol,
      uri: metadata.image,
      sellerFeeBasisPoints: percentAmount(0),
      isCollection: false,
      creators: [
        {
          address: userKeypair.publicKey.toBase58(),
          verified: true,
          share: 100,
        }
      ]
    });

    // Send and confirm transaction
    await transaction.sendAndConfirm(umi);

    // Fetch the created NFT
    const createdNft = await fetchDigitalAsset(umi, mintSigner.publicKey);

    return {
      mint: createdNft.mint.publicKey,
      metadata: createdNft.metadata.publicKey,
      explorerLink: getExplorerLink("address", createdNft.mint.publicKey, "devnet")
    };

  } catch (error) {
    console.error('Error creating NFT:', error);
    throw error;
  }
};

export const verifyEventNFT = async (
  connection: Connection,
  eventId: string,
  holderWallet: PublicKey,
  nftMint: PublicKey
) => {
  try {
    const umi = createUmi(connection.rpcEndpoint);
    umi.use(mplTokenMetadata());

    try {
      // Convert Solana PublicKey to UMI PublicKey
      const umiPublicKey = publicKey(nftMint.toBase58());
      const nft = await fetchDigitalAsset(umi, umiPublicKey);

      // Get the asset's metadata
      const metadata = nft.metadata;

      if (!metadata) {
        return false;
      }

      // Check owner matches using correct property name
      if (metadata.updateAuthority.toString() !== holderWallet.toBase58()) {
        return false;
      }

      // Parse and verify metadata URI content
      try {
        const metadataContent = await (await fetch(metadata.uri)).json();
        const eventIdAttribute = metadataContent.attributes?.find(
          (attr: any) => attr.trait_type === 'Event ID' && attr.value === eventId
        );

        return !!eventIdAttribute;
      } catch (e) {
        console.error('Error fetching metadata content:', e);
        return false;
      }
    } catch (error) {
      console.error('Error fetching NFT:', error);
      return false;
    }
  } catch (error) {
    console.error('Error verifying NFT:', error);
    throw error;
  }
};
