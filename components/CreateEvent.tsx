"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Circle, Edit, Globe, ImageIcon, Loader2, MapPin, PenSquare, Ticket, Users } from "lucide-react"
import { format, set } from "date-fns"
import { useMutation } from "@tanstack/react-query"
import { toast } from "sonner"
import * as z from "zod"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"
import { CreateEvent } from "@/actions/actions"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { createEventSchema } from "@/lib/schema.zod"

type FormData = z.infer<typeof createEventSchema>;

type TimeSlot = {
  value: string;
  label: string;
};

const timeSlots: TimeSlot[] = Array.from({ length: 24 * 4 }, (_, i) => {
  const hour = Math.floor(i / 4);
  const minute = (i % 4) * 15;
  const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
  return {
    value: time,
    label: time,
  };
});

export default function CreateEventForm() {
  const form = useForm<FormData>({
    resolver: zodResolver(createEventSchema) as any,
    defaultValues: {
      title: "",
      description: "",
      location: "",
      isTokenGated: false,
      startTime: new Date(),
      endTime: new Date()
    }
  });

  const mutation = useMutation({
    mutationFn: async (values: FormData) => {
      const response = await CreateEvent(values)
      if (response.status !== 200) {
        toast.error("Something went wrong")
        return
      }
      toast.success("✅ Event Created Successfully")
    }
  })

  const onSubmit = (values: FormData) => {
    // Ensure we're using the selected dates and times
    const startDateTime = values.startTime;
    const endDateTime = values.endTime;

    mutation.mutate({
      ...values,
      startTime: startDateTime,
      endTime: endDateTime
    });
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col md:flex-row items-start gap-8 p-6 min-h-[80svh] mt-14 bg-[#1a1307]"
      >
        <div className="w-full md:w-[320px] relative">
          <img
            className="w-full aspect-square rounded-lg object-cover"
            src="https://images.lumacdn.com/cdn-cgi/image/format=auto,fit=cover,dpr=2,background=white,quality=75,width=400,height=400/gallery-images/xy/13fae58d-87bd-455a-8c6d-c1ba52df7767"
            alt="Event cover"
          />
          <button type="button" className="absolute bottom-3 right-3 bg-white rounded-full p-2">
            <ImageIcon className="w-5 h-5 text-black" />
          </button>
        </div>

        <div className="w-full md:flex-1 text-white">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    {...field}
                    type="text"
                    placeholder="Event Name"
                    className="text-4xl font-light bg-transparent border-0 p-0 h-auto mb-8 placeholder:text-[#9b8e78] focus-visible:ring-0"
                  />
                </FormControl>
                <FormMessage className="text-red-400 mt-1" />
              </FormItem>
            )}
          />

          <div className="bg-[#2a2217] rounded-lg p-4 mb-4">
            <FormField
              control={form.control}
              name="startTime"
              render={({ field }) => (
                <FormItem className="flex items-center mb-4 space-y-0">
                  <div className="w-6 text-gray-400">
                    <Circle className="w-4 h-4" fill="#9b8e78" />
                  </div>
                  <div className="w-16 text-gray-400">Start</div>
                  <FormControl>
                    <div className="flex-1 flex items-center gap-2">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="ghost"
                            className={cn(
                              "flex-1 justify-start text-left font-normal bg-transparent hover:bg-transparent hover:text-white",
                              !field.value && "text-[#9b8e78]",
                            )}
                          >
                            {field.value ? format(field.value, "EEE, MMM d") : "Select date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 bg-[#2a2217] border-[#3a3227]">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={(date) => {
                              if (date) {
                                const currentTime = field.value;
                                const newDate = set(date, {
                                  hours: currentTime.getHours(),
                                  minutes: currentTime.getMinutes()
                                });
                                field.onChange(newDate);
                              }
                            }}
                            initialFocus
                            className="bg-[#2a2217] text-white"
                          />
                        </PopoverContent>
                      </Popover>
                      <Select
                        value={format(field.value, "HH:mm")}
                        onValueChange={(time: string) => {
                          const [hours, minutes] = time.split(":").map(Number);
                          const currentDate = field.value;
                          const newDate = set(currentDate, { hours, minutes });
                          field.onChange(newDate);
                        }}
                      >
                        <SelectTrigger className="w-32 bg-transparent border-0 focus:ring-0 text-right">
                          <SelectValue placeholder="Select time" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#2a2217] border-[#3a3227]">
                          {timeSlots.map((slot) => (
                            <SelectItem
                              key={slot.value}
                              value={slot.value}
                              className="text-white hover:bg-[#3a3227]"
                            >
                              {slot.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="endTime"
              render={({ field }) => (
                <FormItem className="flex items-center space-y-0">
                  <div className="w-6 text-gray-400">
                    <Circle className="w-4 h-4" />
                  </div>
                  <div className="w-16 text-gray-400">End</div>
                  <FormControl>
                    <div className="flex-1 flex items-center gap-2">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="ghost"
                            className={cn(
                              "flex-1 justify-start text-left font-normal bg-transparent hover:bg-transparent hover:text-white",
                              !field.value && "text-[#9b8e78]",
                            )}
                          >
                            {field.value ? format(field.value, "EEE, MMM d") : "Select date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 bg-[#2a2217] border-[#3a3227]">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={(date) => {
                              if (date) {
                                const currentTime = field.value;
                                const newDate = set(date, {
                                  hours: currentTime.getHours(),
                                  minutes: currentTime.getMinutes()
                                });
                                field.onChange(newDate);
                              }
                            }}
                            initialFocus
                            className="bg-[#2a2217] text-white"
                          />
                        </PopoverContent>
                      </Popover>
                      <Select
                        value={format(field.value, "HH:mm")}
                        onValueChange={(time: string) => {
                          const [hours, minutes] = time.split(":").map(Number);
                          const currentDate = field.value;
                          const newDate = set(currentDate, { hours, minutes });
                          field.onChange(newDate);
                        }}
                      >
                        <SelectTrigger className="w-32 bg-transparent border-0 focus:ring-0 text-right">
                          <SelectValue placeholder="Select time" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#2a2217] border-[#3a3227]">
                          {timeSlots.map((slot) => (
                            <SelectItem
                              key={slot.value}
                              value={slot.value}
                              className="text-white hover:bg-[#3a3227]"
                            >
                              {slot.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </FormControl>
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <div
                    className="bg-[#2a2217] rounded-lg p-4 mb-4 cursor-text"
                    onClick={() => document.getElementById("location-input")?.focus()}
                  >
                    <div className="flex items-center text-gray-400">
                      <MapPin className="w-5 h-5 mr-2" />
                      <Input
                        {...field}
                        id="location-input"
                        placeholder="Add Event Location"
                        className="bg-transparent border-0 p-0 h-auto focus-visible:ring-0 placeholder:text-gray-400"
                      />
                    </div>
                    <div className="text-sm text-gray-500 ml-7">Offline location or virtual link</div>
                  </div>
                </FormControl>
                <FormMessage className="text-red-400 mt-1" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <div
                    className="bg-[#2a2217] rounded-lg p-4 mb-8 cursor-text"
                    onClick={() => document.getElementById("description-input")?.focus()}
                  >
                    <div className="flex items-center text-gray-400">
                      <PenSquare className="w-5 h-5 mr-2" />
                      <Textarea
                        {...field}
                        id="description-input"
                        placeholder="Add Description"
                        className="bg-transparent border-0 p-0 min-h-[24px] focus-visible:ring-0 placeholder:text-gray-400 resize-none"
                      />
                    </div>
                  </div>
                </FormControl>
                <FormMessage className="text-red-400 mt-1" />
              </FormItem>
            )}
          />

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

            <FormField
              control={form.control}
              name="isTokenGated"
              render={({ field }) => (
                <FormItem className="space-y-0">
                  <div className="bg-[#2a2217] rounded-lg p-4 mb-3 flex items-center justify-between">
                    <div className="flex items-center">
                      <Users className="w-5 h-5 text-gray-400 mr-3" />
                      <div className="flex flex-col">
                        <div>Token Gated</div>
                        <div className="text-sm text-gray-400">Only NFT holders can attend</div>
                      </div>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="data-[state=checked]:bg-white data-[state=unchecked]:bg-gray-600"
                      />
                    </FormControl>
                  </div>
                  <FormMessage className="text-red-400 mt-1" />
                </FormItem>
              )}
            />
          </div>

          <Button
            type="submit"
            disabled={mutation.isPending}
            className="w-full bg-white text-black hover:bg-gray-100 rounded-lg py-6 text-lg font-medium"
          >
            {mutation.isPending ? <Loader2 className="w-6 h-6 animate-spin" /> : "Create Event"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
