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
      <div className="flex-1 px-6 pb-12">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 gap-6">
            {data?.events.map((event: Event) => (
              <div
                key={event.id}
                className="group relative overflow-hidden bg-gradient-to-br from-black/10 to-black/5 backdrop-blur-sm hover:from-black/20 hover:to-black/10 rounded-xl transition-all duration-300 border border-gray-800/50 hover:border-gray-700"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative p-6">
                  <div className="flex flex-col space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h2 className="text-xl font-medium tracking-tight text-gray-100 group-hover:text-white transition-colors">{event.title}</h2>
                        <time className="block mt-1 text-sm text-gray-400 group-hover:text-gray-300">
                          {new Date(event.startTime).toLocaleDateString('en-US', {
                            weekday: 'long',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </time>
                      </div>
                      <div className="shrink-0 h-8 w-8 rounded-full bg-emerald-500/10 flex items-center justify-center">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-500">
                          <path d="M12 8v4l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1-18 0z" />
                        </svg>
                      </div>
                    </div>
                    <p className="text-gray-400 group-hover:text-gray-300 line-clamp-2 text-sm leading-relaxed">{event.description}</p>
                    <div className="pt-4 flex items-center space-x-4">
                      <Button
                        variant="outline"
                        className="text-xs bg-transparent border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white transition-all duration-200"
                        onClick={() => router.push(`/events/${event.id}`)}
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
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

