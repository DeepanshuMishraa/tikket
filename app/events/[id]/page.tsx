"use client";

import { getEventDetailWithNFT } from "@/actions/actions";
import Image from "next/image";
import { CalendarDays, MapPin, Users, Shield, ExternalLink, Share2, Copy, Check, AlertTriangle, ImageOff } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { EventResponse, ErrorResponse, ApiResponse } from "@/lib/types";


export default function ViewEvent({ params }: { params: { id: string } }) {
  const [copied, setCopied] = useState<string | null>(null);

  const { data, error, isLoading } = useQuery<EventResponse, Error>({
    queryKey: ['event', params.id],
    queryFn: async () => {
      const response = await getEventDetailWithNFT(params.id) as ApiResponse;
      if (!response || response.status !== 200 || !('event' in response)) {
        throw new Error((response as ErrorResponse)?.message || 'Failed to fetch event details.');
      }
      return response as EventResponse;
    },
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });

  const handleCopy = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      setTimeout(() => setCopied(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleShare = async (title?: string) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title || 'Check out this event!',
          url: window.location.href,
        });
      } catch (err) {
        if ((err as DOMException).name !== 'AbortError') {
          console.error("Error sharing:", err);
        }
      }
    } else {
      await handleCopy(window.location.href, "link");
    }
  };

  const formatDateTime = (date: Date) => {
    if (!date) return '';
    return new Date(date).toLocaleString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true
    });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-160px)] bg-transparent text-white/70 p-6">
        <div className="w-12 h-12 border-[5px] border-purple-500/40 border-t-purple-600 rounded-full animate-spin mb-5" />
        <p className="text-xl font-medium">Loading Event...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-160px)] bg-transparent text-white/90 p-6 text-center">
        <AlertTriangle className="w-20 h-20 text-purple-500/60 mb-8" />
        <h1 className="text-3xl md:text-4xl font-semibold mb-4">Event Not Found</h1>
        <p className="text-xl text-white/70 mb-10 max-w-lg">{error?.message || 'We couldn\'t retrieve the event details. Please verify the event ID or try again later.'}</p>
      </div>
    );
  }

  const { event, nftPass, host } = data;

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white selection:bg-purple-500 selection:text-white antialiased">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <header className="mb-16 p-6 rounded-2xl bg-gradient-to-br from-[#16161A]/50 via-[#121214]/50 to-[#0F0F10]/50 border border-white/10 shadow-2xl backdrop-blur-md">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mb-8">
            <div className="flex items-center space-x-4">
              {host?.image ? (
                <Image
                  src={host.image}
                  alt={host.name || "Host"}
                  width={60}
                  height={60}
                  className="rounded-full border-2 border-white/20 shadow-lg object-cover"
                />
              ) : (
                <div className="w-[60px] h-[60px] rounded-full bg-white/10 flex items-center justify-center border-2 border-white/20 shadow-lg">
                  <Users className="w-7 h-7 text-white/50" />
                </div>
              )}
              <div>
                <p className="text-base text-purple-400/90 font-medium tracking-wide">Hosted by</p>
                <h2 className="text-2xl font-bold text-white tracking-tight">{host?.name || 'Anonymous Host'}</h2>
              </div>
            </div>
            <button
              onClick={() => handleShare(event?.title)}
              title="Share this event"
              className="flex items-center space-x-2.5 self-start md:self-auto px-5 py-3 rounded-xl bg-purple-600/80 hover:bg-purple-600 text-white font-semibold transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#121212] shadow-md hover:shadow-lg transform hover:scale-105"
            >
              {copied === "link" ? <Check className="w-5 h-5" /> : <Share2 className="w-5 h-5" />}
              <span>{copied === "link" ? "Link Copied!" : "Share Event"}</span>
            </button>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-orange-300 mb-5 leading-tight shadow-pink-500/20 [text-shadow:_0_2px_10px_var(--tw-shadow-color)]">
            {event?.title || 'Event Title Unavailable'}
          </h1>

          {event?.isTokenGated && (
            <span className="inline-flex items-center space-x-2 px-4 py-1.5 text-sm font-semibold tracking-wide rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 mb-8">
              <Shield className="w-4 h-4" />
              <span>Token Gated Event</span>
            </span>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-4 text-white/80 text-base">
            <InfoPill icon={CalendarDays} label="Date & Time" value={event?.startDate ? formatDateTime(event.startDate) : 'TBD'} />
            {event?.location && <InfoPill icon={MapPin} label="Location" value={event.location} />}
            <InfoPill icon={Users} label="Attendees" value={`${event?.participantsCount ?? 0} attending`} />
          </div>
        </header>
        <div className="grid grid-cols-1 lg:grid-cols-5 lg:gap-12 xl:gap-16">
          <div className="lg:col-span-3 mb-12 lg:mb-0 bg-[#101012]/70 p-6 sm:p-8 rounded-2xl border border-white/10 shadow-xl backdrop-blur-sm">
            <h3 className="text-3xl font-bold text-white/95 mb-6 border-b-2 border-purple-500/30 pb-4 tracking-tight">About this Event</h3>
            {event?.description ? (
              <div className="prose prose-xl prose-invert max-w-none text-white/80 leading-relaxed space-y-5">
                {event.description.split('\n\n').map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center text-white/60">
                <ImageOff className="w-16 h-16 mb-4 opacity-50" />
                <p className="text-lg">No description has been provided for this event.</p>
              </div>
            )}
          </div>
          <div className="lg:col-span-2">
            <div className="bg-gradient-to-br from-[#18181B]/80 via-[#141417]/80 to-[#101013]/80 p-6 sm:p-8 rounded-2xl shadow-2xl border border-white/15 sticky top-8 backdrop-blur-lg">
              <h3 className="text-2xl font-bold text-white/95 mb-6 tracking-tight">Event Access Pass</h3>
              {nftPass ? (
                <div className="space-y-6">
                  <div className="aspect-w-1 aspect-h-1 bg-black/20 rounded-xl overflow-hidden shadow-inner group relative border border-white/10">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-600/30 via-transparent to-blue-600/30 opacity-70 group-hover:opacity-100 transition-opacity duration-300" />
                    <Shield className="w-2/5 h-2/5 text-purple-400/60 absolute inset-0 m-auto opacity-60 group-hover:opacity-80 transition-all duration-300 transform group-hover:scale-110" />
                    <Image src={'/nf.png'} alt='NFT Pass' layout='fill' objectFit='cover' />
                  </div>

                  <div className="space-y-4">
                    <CopyableDetail label="Mint Address" value={nftPass.mintTXHash} type="mint" onCopy={handleCopy} copied={copied} />
                    <CopyableDetail label="Token ID" value={nftPass.tokenId} type="token" onCopy={handleCopy} copied={copied} />
                  </div>

                  <a
                    href={`https://explorer.solana.com/address/${nftPass.mintTXHash}?cluster=devnet`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center w-full space-x-2.5 px-5 py-3.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-base font-semibold tracking-wide transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#121212] shadow-md hover:shadow-lg transform hover:scale-105"
                  >
                    <span>View on Solana Explorer</span>
                    <ExternalLink className="w-5 h-5" />
                  </a>
                </div>
              ) : (
                <div className="text-center py-10 px-4 bg-black/20 rounded-xl border border-white/10">
                  <Shield className="w-16 h-16 text-white/40 mx-auto mb-5 opacity-70" />
                  <h4 className="text-xl font-semibold text-white/90 mb-2">No NFT Pass Required</h4>
                  <p className="text-base text-white/70">This event is open to everyone, or your specific pass isn't displayed here.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
interface CopyableDetailProps {
  label: string;
  value: string;
  type: string;
  onCopy: (text: string, type: string) => void;
  copied: string | null;
}

function CopyableDetail({ label, value, type, onCopy, copied }: CopyableDetailProps) {
  return (
    <div className="bg-black/30 p-4 rounded-lg border border-white/10 shadow hover:border-white/20 transition-colors group">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm text-purple-300/90 uppercase tracking-wider font-semibold group-hover:text-purple-300 transition-colors">{label}</span>
        <button
          onClick={() => onCopy(value, type)}
          title={`Copy ${label}`}
          className="p-1.5 rounded-md text-white/60 hover:text-white hover:bg-white/10 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500"
        >
          {copied === type ?
            <Check className="w-5 h-5 text-green-400" /> :
            <Copy className="w-5 h-5" />
          }
        </button>
      </div>
      <p className="font-mono text-base text-white/80 break-all select-all pr-2 group-hover:text-white/90 transition-colors">
        {value}
      </p>
    </div>
  );
}

interface InfoPillProps {
  icon: React.ElementType;
  label: string;
  value: string;
}

function InfoPill({ icon: Icon, label, value }: InfoPillProps) {
  return (
    <div className="flex items-center space-x-2.5 bg-white/[0.03] p-3 rounded-lg border border-white/10 shadow-sm hover:border-white/20 transition-colors">
      <Icon className="w-6 h-6 text-purple-400/80 flex-shrink-0" />
      <div>
        <p className="text-xs text-white/60 uppercase tracking-wider font-medium">{label}</p>
        <p className="text-base text-white/90 font-semibold">{value}</p>
      </div>
    </div>
  );
}
