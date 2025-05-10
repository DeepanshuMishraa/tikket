"use server";

import { db } from "@/db";
import { events, walletDetails, nftPasses } from "@/db/schema";
import { auth } from "@/lib/auth"
import { createEventSchema, joinEventSchema } from "@/lib/schema.zod";
import { and, eq } from "drizzle-orm";
import { headers } from "next/headers"
import { v4 as uuid } from "uuid";
import { Connection, clusterApiUrl, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { createEventNFT, NFTMetadata } from "@/lib/solana";

export const getEventsForUser = async () => {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session?.user) {
      throw new Error("User not authorized");
    }

    const userId = session?.user.id;

    const event = await db.select().from(events).where(eq(events.participantId, userId));

    if (event.length === 0) {
      return {
        message: "No events found for this user",
        events: []
      }
    }

    return {
      message: "Events fetched successfully",
      events: event
    }
  } catch (error) {
    console.error("Error fetching events for user:", error);
    return {
      message: "Error fetching events",
      events: []
    }
  }
}

export const CreateEvent = async (data: unknown) => {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session?.user) {
      throw new Error("User not authorized");
    }

    const userId = session?.user.id;

    const parsedData = createEventSchema.safeParse(data);

    if (!parsedData.success) {
      return {
        message: "Invalid data",
        errors: parsedData.error.errors
      }
    }

    const { title, description, startTime, endTime, isTokenGated, location, startDate, endDate } = parsedData.data;
    const eventId = uuid();

    await db.insert(events).values({
      title,
      description,
      startTime,
      endTime,
      isTokenGated,
      location,
      id: eventId,
      organiserId: userId,
      participantsCount: "0",
      participantId: userId,
      startDate,
      endDate
    });

    return {
      message: "Event created successfully",
      status: 200,
      event: {
        id: eventId,
        title,
        description,
        startTime,
        endTime,
        isTokenGated,
        location,
        organiserId: userId,
        participantsCount: "0",
        participantId: userId,
        createdAt: new Date()
      }
    }
  } catch (error) {
    console.error("Error creating event:", error);
    return {
      message: "Error creating event",
      error: error,
      status: 501
    }
  }
}

export const saveWalletDetails = async (pubKey: string) => {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session?.user) {
      throw new Error("User not authorized");
    }
    const userId = session?.user.id;

    const publicKey = new PublicKey(pubKey)

    const connection = new Connection(clusterApiUrl("devnet"));

    const balance = await connection.getBalance(publicKey);
    const balanceInSol = balance / LAMPORTS_PER_SOL;

    await db.insert(walletDetails).values({
      id: uuid(),
      userId: userId,
      publicKey: pubKey,
      solBalance: balanceInSol,
    })

    return {
      message: "Wallet details saved successfully",
      walletDetails: {
        id: uuid(),
        userId: userId,
        publicKey: pubKey.toString(),
        solBalance: balanceInSol,
        createdAt: new Date()
      }
    }
  } catch (error) {
    console.error("Error saving wallet details:", error);
    return {
      message: "Error saving wallet details",
      error: error
    }
  }
}

export const GetAllEvents = async () => {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    })

    if (!session?.user) {
      throw new Error("User not authorized")
    }

    const all_events = await db.select().from(events);

    if (all_events.length === 0) {
      return {
        message: "No events found",
        events: []
      }
    }

    return {
      message: "Events fetched successfully",
      events: all_events
    }
  } catch (error) {
    console.error("Error fetching all events:", error);
    return {
      message: "Error fetching all events",
      error: error
    }
  }
}

export const GetEventByID = async (id: string) => {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session?.user) {
      throw new Error("User not authorized");
    }

    const event = await db.select().from(events).where(eq(events.id, id));

    if (event.length === 0) {
      return {
        message: "Event not found",
        event: null
      }
    }

    return {
      status: 200,
      event: event[0]
    }
  } catch (error) {
    console.error("Error fetching event by ID:", error);
    return {
      message: "Error fetching event",
      error: error,
      status: 501,
    }
  }
}

export const JoinEvent = async (data: any) => {
  const parsedData = joinEventSchema.safeParse(data);
  if (!parsedData.success) {
    return {
      message: "Invalid data",
      errors: parsedData.error.errors
    }
  }
  const { eventId, walletSecretKey } = parsedData.data;

  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session?.user) {
      throw new Error("User not authorized");
    };

    const userId = session?.user.id;
    const event = await db.select().from(events).where(eq(events.id, eventId));

    if (event.length === 0) {
      return {
        message: "Event not found",
        status: 404
      }
    }

    const wallet = await db.select().from(walletDetails).where(eq(walletDetails.userId, userId));
    if (wallet.length === 0) {
      return {
        message: "Wallet not found",
        status: 404
      }
    };

    const walletAddress = wallet[0].publicKey;

    // Check if user already has an NFT pass for this event
    const existingPass = await db.select()
      .from(nftPasses)
      .where(and(eq(nftPasses.eventId, eventId), eq(nftPasses.userId, userId)));

    if (existingPass.length > 0) {
      return {
        message: "You have already joined this event",
        status: 400
      }
    }

    const connection = new Connection(clusterApiUrl("devnet"));
    const recipientWallet = new PublicKey(walletAddress);

    // Create metadata for the event NFT
    const metadata: NFTMetadata = {
      name: `${event[0].title} Ticket`,
      symbol: "TIKT",
      description: `Access pass for ${event[0].title} on ${new Date(event[0].startDate).toLocaleDateString()}`,
      image: "ipfs://QmbXw6o2ieb4Xqi59HJhfikAMuZm9rMaBY3gDH3e23XSv4", // You should update this with your actual IPFS hash
      attributes: [
        {
          trait_type: "Event ID",
          value: eventId
        },
        {
          trait_type: "Event Date",
          value: new Date(event[0].startDate).toISOString()
        },
        {
          trait_type: "User ID",
          value: userId
        }
      ]
    };

    // Create NFT using UMI approach with user's wallet for signing
    const nftResult = await createEventNFT(
      connection,
      {
        publicKey: recipientWallet,
        secretKey: Buffer.from(walletSecretKey, 'base64')
      },
      metadata
    );

    // Save NFT details
    await db.insert(nftPasses).values({
      id: uuid(),
      eventId: eventId,
      userId: userId,
      mintTXHash: nftResult.explorerLink,
      tokenId: nftResult.mint.toString(),
      claimed: false,
    });

    // Update event participants count
    const currentCount = parseInt(event[0].participantsCount || "0");
    await db.update(events)
      .set({
        participantsCount: (currentCount + 1).toString(),
        participantId: userId
      })
      .where(eq(events.id, eventId));

    return {
      message: "Successfully joined event and minted NFT ticket",
      status: 200,
      nftDetails: {
        mint: nftResult.mint.toString(),
        metadata: nftResult.metadata.toString(),
        explorerLink: nftResult.explorerLink
      }
    }

  } catch (error) {
    console.error("Error joining event:", error);
    return {
      message: "Error joining event",
      error: error,
      status: 501
    }
  }
}
