'use client'

import { getEventsForUser } from "@/actions/actions";
import { Button } from "@/components/ui/button";
import { Event } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";
import { PlusIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import EventsBar from "@/components/events.topbar";
import { useState } from "react";
import EventCard from "@/components/EventCard";

export default function EventsPage() {
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
  const router = useRouter();

  const { isLoading, isError, data } = useQuery({
    queryKey: ["events", activeTab],
    queryFn: async () => {
      const result = await getEventsForUser(activeTab);
      return result;
    }
  });

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="text-gray-400">Loading events...</div>
        </div>
      );
    }

    if (isError) {
      return (
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="text-red-400">Failed to load events</div>
        </div>
      );
    }

    if (!data?.events?.length) {
      return (
        <div className="flex items-center justify-center min-h-[50vh] flex-col gap-4">
          <div className="text-gray-400">No {activeTab} events found</div>
          <Button
            onClick={() => router.push('/events/create')}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            Create Event
          </Button>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
        {data.events.map((event) => (
          <EventCard key={event.id} event={event} variant="events" />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-7xl mx-auto">
        <EventsBar activeTab={activeTab} onTabChange={setActiveTab} />
        {renderContent()}
      </div>
    </div>
  );
}

