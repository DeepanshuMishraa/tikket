import { Event } from "@/lib/types";
import { CalendarDays, MapPin, Users } from "lucide-react";
import { useRouter } from "next/navigation";

interface EventCardProps {
  event: Event;
  variant?: 'discover' | 'events';
}

export default function EventCard({ event, variant = 'discover' }: EventCardProps) {
  const router = useRouter();

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  const handleClick = () => {
    const route = variant === 'discover' ? `/discover/${event.id}` : `/events/${event.id}`;
    router.push(route);
  };

  return (
    <div
      onClick={handleClick}
      className="bg-gray-900/50 rounded-xl overflow-hidden border border-white/10 hover:border-purple-500/50 transition-all duration-300 cursor-pointer group p-6"
    >
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-white/90">
          {event.title}
        </h3>

        <p className="text-sm text-white/70 line-clamp-2">
          {event.description}
        </p>

        <div className="space-y-2 text-sm text-white/70">
          <div className="flex items-center gap-2">
            <CalendarDays className="w-4 h-4" />
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
  );
} 
