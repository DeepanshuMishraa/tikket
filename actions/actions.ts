"use server";

import { db } from "@/db";
import { events, walletDetails, nftPasses, user, eventParticipants } from "@/db/schema";
import { auth } from "@/lib/auth"
import { createEventSchema, joinEventSchema } from "@/lib/schema.zod";
import { and, eq, gte, lt, or, gt } from "drizzle-orm";
import { headers } from "next/headers"
import { v4 as uuid } from "uuid";
import { Connection, clusterApiUrl, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { createNFT } from "@/lib/nft";
import path from "path";

export const getEventsForUser = async (filter: 'upcoming' | 'past' = 'upcoming') => {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session?.user) {
      throw new Error("User not authorized");
    }

    const userId = session.user.id;
    const now = new Date();

    // Get only events where the user is actually registered
    const userEvents = await db
      .select({
        event: events,
      })
      .from(eventParticipants)
      .innerJoin(
        events,
        eq(events.id, eventParticipants.eventId)
      )
      .where(
        and(
          eq(eventParticipants.userId, userId),
          eq(eventParticipants.isRegistered, true),
          // Compare with both date and time
          filter === 'upcoming'
            ? or(
              gt(events.startDate, now), // Start date is in future
              and(
                eq(events.startDate, now), // Same day but...
                gt(events.startTime, now)  // Start time is in future
              )
            )
            : or(
              lt(events.startDate, now), // Start date is in past
              and(
                eq(events.startDate, now), // Same day but...
                lt(events.startTime, now)  // Start time is in past
              )
            )
        )
      );

    return {
      status: 200,
      message: `${filter} events fetched successfully`,
      events: userEvents.map(ue => ue.event)
    }
  } catch (error) {
    console.error("Error fetching events for user:", error);
    return {
      status: 500,
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

    const { title, description, startTime, endTime, isTokenGated, location } = parsedData.data;
    const eventId = uuid();

    // Store the event with the selected dates
    await db.insert(events).values({
      id: eventId,
      title,
      description,
      startTime,
      endTime,
      isTokenGated,
      location,
      organiserId: userId,
      participantsCount: "1",
      startDate: startTime,
      endDate: endTime
    });

    await db.insert(eventParticipants).values({
      id: uuid(),
      eventId: eventId,
      userId: userId,
      isRegistered: true,
      createdAt: new Date(),
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
        participantsCount: "1",
        startDate: startTime,
        endDate: endTime,
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

export const JoinEvent = async (data: { eventId: string, type?: 'simple' | 'nft' }) => {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session?.user) {
      return {
        status: 401,
        message: "User not authorized"
      }
    }

    const userId = session.user.id;
    const event = await db.select().from(events).where(eq(events.id, data.eventId));

    if (event.length === 0) {
      return {
        status: 404,
        message: "Event not found"
      }
    }

    // Check if user is already registered
    const existingRegistration = await db
      .select()
      .from(eventParticipants)
      .where(
        and(
          eq(eventParticipants.eventId, data.eventId),
          eq(eventParticipants.userId, userId)
        )
      );

    if (existingRegistration.length > 0) {
      return {
        status: 400,
        message: "You are already registered for this event"
      }
    }

    // For token gated events, require NFT registration
    if (event[0].isTokenGated && data.type !== 'nft') {
      return {
        status: 400,
        message: "This event requires NFT registration"
      }
    }

    // Register the user
    await db.insert(eventParticipants).values({
      id: uuid(),
      eventId: data.eventId,
      userId: userId,
      isRegistered: true,
      createdAt: new Date()
    });

    // Increment participants count
    const currentCount = parseInt(event[0].participantsCount || "0");
    await db
      .update(events)
      .set({ participantsCount: (currentCount + 1).toString() })
      .where(eq(events.id, data.eventId));

    // If token gated, create and return NFT details
    if (event[0].isTokenGated) {
      // Your existing NFT creation logic
      const nftResult = await createNFT(
        {
          title: event[0].title,
          description: event[0].description,
          startDate: event[0].startTime,
          endDate: event[0].endTime,
          location: event[0].location || "TBA",
          eventId: event[0].id,
        },
        path.join(process.cwd(), "public", "nf.png")
      );
      return {
        status: 200,
        message: "Successfully registered with NFT",
        nftDetails: nftResult
      }
    }

    // For non-token gated events, just return success
    return {
      status: 200,
      message: "Successfully registered for event"
    }
  } catch (error) {
    console.error("Error joining event:", error);
    return {
      status: 500,
      message: "Failed to join event"
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

    const event = await db.select().from(events).where(eq(events.id, id));
    if (event.length === 0) {
      return {
        message: "Event not found",
        status: 404
      }
    }

    const isOrganiser = event[0].organiserId === userId;

    const nftPass = !isOrganiser ? await db.select()
      .from(nftPasses)
      .where(
        and(
          eq(nftPasses.eventId, id),
          eq(nftPasses.userId, userId)
        )
      ) : null;

    const host = await getUserDetails(event[0].organiserId as string);

    return {
      status: 200,
      event: event[0],
      nftPass: nftPass?.[0] || null,
      host: {
        name: host.user?.name,
        image: session.user.image
      },
      isOrganiser
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

export const checkEventRegistration = async (eventId: string) => {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session?.user) {
      return {
        status: 401,
        isRegistered: false,
        nftDetails: null
      };
    }

    const userId = session.user.id;

    const registration = await db
      .select()
      .from(eventParticipants)
      .where(
        and(
          eq(eventParticipants.eventId, eventId),
          eq(eventParticipants.userId, userId),
          eq(eventParticipants.isRegistered, true) // Make sure they are actually registered
        )
      );

    const event = await db
      .select()
      .from(events)
      .where(eq(events.id, eventId));

    const isOrganizer = event[0]?.organiserId === userId;

    let nftDetails = null;
    if (registration.length > 0 && !isOrganizer) {
      const nftPass = await db
        .select()
        .from(nftPasses)
        .where(
          and(
            eq(nftPasses.eventId, eventId),
            eq(nftPasses.userId, userId)
          )
        );
      nftDetails = nftPass[0] || null;
    }

    return {
      status: 200,
      isRegistered: registration.length > 0 || isOrganizer,
      isOrganizer,
      nftDetails
    };
  } catch (error) {
    console.error("Error checking registration:", error);
    return {
      status: 500,
      isRegistered: false,
      isOrganizer: false,
      nftDetails: null
    };
  }
};
