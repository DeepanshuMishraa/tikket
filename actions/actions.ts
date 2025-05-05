"use server";

import { db } from "@/db";
import { events, walletDetails } from "@/db/schema";
import { auth } from "@/lib/auth"
import { createEventSchema } from "@/lib/schema.zod";
import { eq } from "drizzle-orm";
import { headers } from "next/headers"
import { v4 as uuid } from "uuid";
import { Connection, clusterApiUrl, LAMPORTS_PER_SOL, PublicKey, } from "@solana/web3.js";


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
