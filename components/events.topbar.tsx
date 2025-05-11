import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface EventsBarProps {
  activeTab: 'upcoming' | 'past';
  onTabChange: (value: 'upcoming' | 'past') => void;
}

export default function EventsBar({ activeTab, onTabChange }: EventsBarProps) {
  return (
    <div className="flex items-center mt-20 justify-between py-4 px-6">
      <h1 className="text-3xl font-normal text-white">Events</h1>
      <Tabs defaultValue={activeTab} onValueChange={(value) => onTabChange(value as 'upcoming' | 'past')}>
        <TabsList className="bg-[#2a2229] p-1 rounded-lg">
          <TabsTrigger
            value="upcoming"
            className="px-6 py-2 rounded-md data-[state=active]:bg-[#3a3139] data-[state=active]:text-white text-gray-400"
          >
            Upcoming
          </TabsTrigger>
          <TabsTrigger
            value="past"
            className="px-6 py-2 rounded-md data-[state=active]:bg-[#3a3139] data-[state=active]:text-white text-gray-400"
          >
            Past
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  )
}
