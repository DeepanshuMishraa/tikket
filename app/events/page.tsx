'use client'

import { getEventsForUser } from "@/actions/actions";
import { Button } from "@/components/ui/button";
import { Event } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";
import { PlusIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import EventsBar from "@/components/events.topbar";

export default function EventsPage() {
  const { isLoading, isError, data } = useQuery({
    queryKey: ["events"],
    queryFn: async () => {
      const result = await getEventsForUser();
      return result;
    }
  });

  const router = useRouter();

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-500">Loading...</p>
        </div>
      );
    }

    if (isError) {
      return (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-red-500">Error fetching events</p>
        </div>
      );
    }

    if (data?.events.length === 0) {
      return (
        <div className="flex-1 flex items-center justify-center flex-col gap-y-6">
          <p className="text-gray-300 text-xl">No Upcoming Events</p>
          <p className="text-gray-300">You have no upcoming events. Why not host one?</p>
          <Button
            onClick={() => router.push("/events/create")}
            className="flex items-center justify-center bg-gray-700 text-gray-300 hover:bg-gray-900 duration-200 cursor-pointer rounded-md"
            variant={null}
          >
            <PlusIcon /> Create Event
          </Button>
        </div>
      );
    }

    return (
      <div className="flex-1 p-6">
        <div className="max-w-4xl mx-auto">
          <ul>
            {data?.events.map((event: Event) => (
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
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="mt-16 p-6">
        <div className="max-w-4xl mx-auto">
          <EventsBar />
        </div>
      </div>
      {renderContent()}
    </div>
  );
}

