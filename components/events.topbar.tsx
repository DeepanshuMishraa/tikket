import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function EventsBar() {
  return (
    <div className="flex items-center justify-between py-4 px-6">
      <h1 className="text-3xl font-normal text-white">Events</h1>
      <Tabs defaultValue="upcoming">
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
