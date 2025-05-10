'use client'

import { GetAllEvents } from "@/actions/actions"
import { Event } from "@/lib/types"
import { useQuery } from "@tanstack/react-query"
import { MapPin } from "lucide-react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

export default function DiscoverPage() {
  const router = useRouter()
  const { data, isLoading, isError } = useQuery({
    queryKey: ["events"],
    queryFn: async () => {
      const result = await GetAllEvents()
      return result
    }
  })

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="text-gray-400">Loading events...</div>
        </div>
      )
    }

    if (isError) {
      return (
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="text-red-400">Failed to load events</div>
        </div>
      )
    }

    if (!data?.events?.length) {
      return (
        <div className="flex items-center justify-center min-h-[40vh] flex-col gap-4">
          <div className="text-gray-400">No events found</div>
          <Button
            onClick={() => router.push('/events/create')}
            className="bg-transparent border border-gray-800 text-gray-400 hover:bg-gray-900/50"
          >
            Create an Event
          </Button>
        </div>
      )
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {data.events.map((event: Event) => (
          <div
            key={event.id}
            onClick={() => router.push(`/discover/${event.id}`)}
            className="group cursor-pointer"
          >
            <div className="relative overflow-hidden bg-black/5 backdrop-blur-sm rounded-2xl border border-gray-800/50 hover:border-gray-700/50 transition-all duration-500">
              <div className="p-6 flex flex-col gap-6">
                <div className="space-y-4">
                  <div>
                    <time className="text-xs tracking-wide text-gray-500 uppercase">
                      {new Date(event.startTime).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric'
                      })}
                      {' · '}
                      {new Date(event.startTime).toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true
                      })}
                    </time>
                    <h3 className="text-lg font-medium text-gray-200 mt-1 group-hover:text-white transition-colors">
                      {event.title}
                    </h3>
                  </div>

                  <p className="text-sm text-gray-400 line-clamp-2 group-hover:text-gray-300 transition-colors">
                    {event.description}
                  </p>
                </div>

                {event.location && (
                  <div className="flex items-center gap-2 text-gray-500 text-xs">
                    <MapPin className="w-3 h-3" />
                    <span className="truncate">{event.location}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="min-h-screen p-8 mt-20">
      <div className="max-w-6xl mx-auto">
        <div className="space-y-2 mb-16">
          <h1 className="text-2xl font-medium text-gray-200">Discover Events</h1>
          <p className="text-gray-400 text-sm">
            Explore curated events and experiences
          </p>
        </div>
        {renderContent()}
      </div>
    </div>
  )
}
