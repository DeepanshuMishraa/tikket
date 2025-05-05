'use client'

import { getEventsForUser } from "@/actions/actions";
import { Event } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";


export default function EventsPage() {
  const { isLoading, isError, data } = useQuery({
    queryKey: ["events"],
    queryFn: async () => {
      const result = await getEventsForUser();
      return result;
    }
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-red-500">Error fetching events</p>
      </div>
    );
  }

  if (!data?.events || data.events.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-500">{data?.message || "No events found"}</p>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Your Events</h1>
        <ul>
          {data.events.map((event: Event) => (
            <li key={event.id} className="mb-4 p-4 border rounded-lg">
              <h2 className="text-xl font-semibold">{event.title}</h2>
              <p>{event.description}</p>
              <p>{new Date(event.startTime).toLocaleString()}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

