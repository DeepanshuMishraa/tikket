"use server";

import { db } from "@/db";
import { events } from "@/db/schema";
import { auth } from "@/lib/auth"
import { eq } from "drizzle-orm";
import { headers } from "next/headers"


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
