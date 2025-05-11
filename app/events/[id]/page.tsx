"use client";

import { getEventDetailWithNFT } from "@/actions/actions";
import { CalendarDays, MapPin, CheckCircle, ExternalLink } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";

interface EventDetailsResponse {
  status: number;
  event: {
    id: string;
    title: string;
    description: string;
    startDate: string;
    location: string | null;
  };
  nftPass: {
    mintTXHash: string;
    tokenId: string;
  } | null;
  host: {
    name: string | null;
    image: string | null;
  };
}

export default function EventDetailsPage({ params }: { params: { id: string } }) {
  const { data, error, isLoading } = useQuery<EventDetailsResponse>({
    queryKey: ['event-details', params.id],
    queryFn: async () => {
      const result = await getEventDetailWithNFT(params.id);
      if (!result || result.status !== 200) {
        throw new Error(result?.message || 'Failed to fetch event details');
      }
      return result as EventDetailsResponse;
    }
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-red-400">Failed to load event details</div>
      </div>
    );
  }

  const { event, nftPass, host } = data;

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-4xl mx-auto mt-16">
        <div className="bg-gray-900/50 rounded-xl p-8 border border-white/10">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-4">{event.title}</h1>
            <div className="flex items-center gap-4 text-gray-400">
              <div className="flex items-center gap-2">
                <CalendarDays className="w-5 h-5" />
                <span>{format(new Date(event.startDate), 'MMM dd, yyyy')}</span>
              </div>
              {event.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  <span>{event.location}</span>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-xl font-semibold mb-4">Event Details</h2>
              <p className="text-gray-300">{event.description}</p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-4">Your NFT Pass</h2>
              {nftPass ? (
                <div className="bg-gray-800/50 rounded-lg p-4 border border-purple-500/20">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-400" />
                      <span className="text-green-400">Pass Active</span>
                    </div>
                    <a
                      href={`https://explorer.solana.com/address/${nftPass.mintTXHash}?cluster=devnet`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-400 hover:text-purple-300 flex items-center gap-1"
                    >
                      View on Explorer
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                  <div className="text-sm text-gray-400">
                    <p className="mb-2">Mint Address:</p>
                    <code className="bg-black/30 p-2 rounded block overflow-x-auto">
                      {nftPass.mintTXHash}
                    </code>
                  </div>
                </div>
              ) : (
                <div className="text-gray-400">
                  No NFT pass found for this event.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
