"use server";

import { db } from "@/db";
import { events, walletDetails, nftPasses, user } from "@/db/schema";
import { auth } from "@/lib/auth"
import { createEventSchema, joinEventSchema } from "@/lib/schema.zod";
import { and, eq } from "drizzle-orm";
import { headers } from "next/headers"
import { v4 as uuid } from "uuid";
import { Connection, clusterApiUrl, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { createNFT } from "@/lib/nft";
import path from "path";

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

export const getUserDetails = async (id: string) => {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session?.user) {
      throw new Error("User not authorized");
    }

    const users = await db.select().from(user).where(eq(user.id, id));

    if (users.length === 0) {
      return {
        message: "User not found",
        status: 404
      }
    }

    return {
      status: 200,
      user: users[0]
    }
  } catch (error) {
    console.error("Error fetching user details:", error);
    return {
      message: "Error fetching user details",
      error: error,
      status: 501
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
  const { eventId } = parsedData.data;

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
    const existingPass = await db.select()
      .from(nftPasses)
      .where(and(eq(nftPasses.eventId, eventId), eq(nftPasses.userId, userId)));

    if (existingPass.length > 0) {
      return {
        message: "You have already joined this event",
        status: 400
      }
    }

    // Create NFT with event metadata
    const eventData = event[0];
    const nftResult = await createNFT(
      {
        title: eventData.title,
        description: eventData.description,
        startDate: eventData.startDate,
        endDate: eventData.endDate,
        location: eventData.location || "TBA",
        eventId: eventData.id,
      },
      path.join(process.cwd(), "public", "nf.png")
    );

    // Save NFT details to database
    const nftPassId = uuid();
    await db.insert(nftPasses).values({
      id: nftPassId,
      eventId: eventId,
      userId: userId,
      mintTXHash: nftResult.mint,
      tokenId: nftResult.metadata,
      claimed: false,
      createdAt: new Date(),
    });

    // Update event participants count
    const currentCount = parseInt(eventData.participantsCount) || 0;
    await db.update(events)
      .set({ participantsCount: (currentCount + 1).toString() })
      .where(eq(events.id, eventId));

    return {
      status: 200,
      message: "Successfully joined event",
      nftDetails: {
        mint: nftResult.mint,
        metadata: nftResult.metadata,
        explorerLink: nftResult.explorerLink
      }
    };

  } catch (error) {
    console.error("Error joining event:", error);
    return {
      message: "Error joining event",
      error: error,
      status: 501
    }
  }
}

export const getEventDetails = async (id: string) => {
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
        status: 404
      }
    }

    return {
      status: 200,
      title: event[0].title,
      description: event[0].description,
      startTime: event[0].startTime,
      endTime: event[0].endTime,
      isTokenGated: event[0].isTokenGated,
      location: event[0].location,
      startDate: event[0].startDate,
      endDate: event[0].endDate,
      participantsCount: event[0].participantsCount,
      hostedBy: (await getUserDetails(event[0].organiserId as string)).user?.name,
      hostedByImage: session?.user.image
    }


  } catch (error) {
    console.error("Error fetching event details:", error);
    return {
      message: "Error fetching event details",
      error: error,
      status: 501
    }
  }
}

export const getEventDetailWithNFT = async (id: string) => {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session?.user) {
      throw new Error("User not authorized");
    }

    const userId = session.user.id;

    // Get event details
    const event = await db.select().from(events).where(eq(events.id, id));
    if (event.length === 0) {
      return {
        message: "Event not found",
        status: 404
      }
    }

    // Get NFT pass details for this user and event
    const nftPass = await db.select()
      .from(nftPasses)
      .where(
        and(
          eq(nftPasses.eventId, id),
          eq(nftPasses.userId, userId)
        )
      );

    // Get host details
    const host = await getUserDetails(event[0].organiserId as string);

    return {
      status: 200,
      event: event[0],
      nftPass: nftPass[0] || null,
      host: {
        name: host.user?.name,
        image: session.user.image
      }
    }
  } catch (error) {
    console.error("Error fetching event detail with NFT:", error);
    return {
      message: "Error fetching event details",
      error: error,
      status: 501
    }
  }
}
