"use client"

import { useState } from "react"
import { Input } from "./ui/input"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Edit, Globe, ImageIcon, MapPin, PenSquare, Ticket, User, Users } from "lucide-react"

export default function CreateEventForm() {
  const [requireApproval, setRequireApproval] = useState(false)

  return (
    <div className="flex flex-col md:flex-row items-start gap-8 p-6 min-h-[80svh] mt-14 bg-[#1a1307]">
      <div className="w-full md:w-[320px] relative">
        <img
          className="w-full aspect-square rounded-lg object-cover"
          src="https://images.lumacdn.com/cdn-cgi/image/format=auto,fit=cover,dpr=2,background=white,quality=75,width=400,height=400/gallery-images/xy/13fae58d-87bd-455a-8c6d-c1ba52df7767"
          alt="Event cover"
        />
        <button className="absolute bottom-3 right-3 bg-white rounded-full p-2">
          <ImageIcon className="w-5 h-5 text-black" />
        </button>
      </div>
      <div className="w-full md:flex-1 text-white">
        <Input
          type="text"
          placeholder="Event Name"
          className="text-4xl font-light bg-transparent border-0 p-0 h-auto mb-8 placeholder:text-[#9b8e78] focus-visible:ring-0"
        />
        <div className="bg-[#2a2217] rounded-lg p-4 mb-4">
          <div className="flex items-center mb-4">
            <div className="w-6 text-gray-400">
            <Circle className="w-4 h-4" fill="#9b8e78" />
            </div>
            <div className="w-16 text-gray-400">Start</div>
            <div className="flex-1">Mon, May 5</div>
            <div className="w-32 text-right">11:30 AM</div>
          </div>

          <div className="flex items-center">
            <div className="w-6 text-gray-400">
              <Circle className="w-4 h-4" />
            </div>
            <div className="w-16 text-gray-400">End</div>
            <div className="flex-1">Mon, May 5</div>
            <div className="w-32 text-right">12:30 PM</div>
          </div>
        </div>
        <div className="bg-[#2a2217] rounded-lg p-4 mb-4 flex items-center">
          <div className="flex-1">
            <div className="text-gray-400">GMT+05:30</div>
            <div>Kolkata</div>
          </div>
          <Globe className="w-5 h-5 text-gray-400" />
        </div>
        <div className="bg-[#2a2217] rounded-lg p-4 mb-4">
          <div className="flex items-center text-gray-400">
            <MapPin className="w-5 h-5 mr-2" />
            <div>Add Event Location</div>
          </div>
          <div className="text-sm text-gray-500 ml-7">Offline location or virtual link</div>
        </div>
        <div className="bg-[#2a2217] rounded-lg p-4 mb-8">
          <div className="flex items-center text-gray-400">
            <PenSquare className="w-5 h-5 mr-2" />
            <div>Add Description</div>
          </div>
        </div>

        <div className="mb-4">
          <div className="text-lg mb-4">Event Options</div>
          <div className="bg-[#2a2217] rounded-lg p-4 mb-3 flex items-center justify-between">
            <div className="flex items-center">
              <Ticket className="w-5 h-5 text-gray-400 mr-3" />
              <div>Tickets</div>
            </div>
            <div className="flex items-center text-gray-400">
              <div className="mr-2">Free</div>
              <Edit className="w-4 h-4" />
            </div>
          </div>

          {/* Require Approval */}
          <div className="bg-[#2a2217] rounded-lg p-4 mb-3 flex items-center justify-between">
            <div className="flex items-center">
              <Users className="w-5 h-5 text-gray-400 mr-3" />
              <div>Require Approval</div>
            </div>
            <Switch
              checked={requireApproval}
              onCheckedChange={setRequireApproval}
              className="data-[state=checked]:bg-white data-[state=unchecked]:bg-gray-600"
            />
          </div>
          <div className="bg-[#2a2217] rounded-lg p-4 mb-8 flex items-center justify-between">
            <div className="flex items-center">
              <Users className="w-5 h-5 text-gray-400 mr-3" />
              <div>Capacity</div>
            </div>
            <div className="flex items-center text-gray-400">
              <div className="mr-2">Unlimited</div>
              <Edit className="w-4 h-4" />
            </div>
          </div>
        </div>

        <Button className="w-full bg-white text-black hover:bg-gray-100 rounded-lg py-6 text-lg font-medium">
          Create Event
        </Button>
      </div>
    </div>
  )
}

// Custom icons
function ChevronDown() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  )
}

function ShareIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
      <polyline points="16 6 12 2 8 6" />
      <line x1="12" y1="2" x2="12" y2="15" />
    </svg>
  )
}

function Circle({ fill = "none", ...props }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill={fill}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <circle cx="12" cy="12" r="10" />
    </svg>
  )
}
