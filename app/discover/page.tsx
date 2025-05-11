'use client'

import { GetAllEvents } from "@/actions/actions"
import { Event } from "@/lib/types"
import { useQuery } from "@tanstack/react-query"
import { MapPin, Calendar, Users } from "lucide-react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

export default function DiscoverPage() {
  const router = useRouter()
  const { data, isLoading, isError } = useQuery({
    queryKey: ["all-events"],
    queryFn: async () => {
      const result = await GetAllEvents()
      return result
    }
  })

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <h1 className="text-3xl font-bold mb-8 mt-16">Discover Events</h1>

      {isLoading ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="text-gray-400">Loading events...</div>
        </div>
      ) : isError ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="text-red-400">Failed to load events</div>
        </div>
      ) : !data?.events?.length ? (
        <div className="flex items-center justify-center min-h-[40vh] flex-col gap-4">
          <div className="text-gray-400">No events found</div>
          <Button
            onClick={() => router.push('/events/create')}
            className="bg-purple-600 hover:bg-purple-700"
          >
            Create an Event
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {data.events.map((event: Event) => (
            <div
              key={event.id}
              onClick={() => router.push(`/discover/${event.id}`)}
              className="bg-gray-900/50 rounded-xl border border-white/10 hover:border-purple-500/50 transition-all duration-300 cursor-pointer group p-6"
            >
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-white/90 line-clamp-2">
                  {event.title}
                </h3>

                <p className="text-sm text-white/70 line-clamp-2">
                  {event.description}
                </p>

                <div className="space-y-2 text-sm text-white/70">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(event.startDate)}</span>
                  </div>

                  {event.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      <span className="line-clamp-1">{event.location}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    <span>{event.participantsCount} attending</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
