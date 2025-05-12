"use client"

import { GetEventByID, getEventDetails, JoinEvent, saveWalletDetails, checkEventRegistration } from "@/actions/actions"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import { MapPinIcon, ChevronRightIcon, XIcon, TwitterIcon, GlobeIcon, ExternalLinkIcon, LoaderIcon, CheckCircleIcon, CalendarIcon, ClockIcon } from "lucide-react"
import { useWallet } from "@solana/wallet-adapter-react"
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui"
import { useState, useEffect } from "react"
import { toast } from "sonner"

interface NFTDetails {
  id: string;
  eventId: string;
  userId: string;
  mintTXHash: string;
  tokenId: string;
  claimed: boolean;
  createdAt: Date;
}

interface RegistrationData {
  status: number;
  isRegistered: boolean;
  isOrganizer: boolean;
  nftDetails: NFTDetails | null;
}

interface EventData {
  status: number;
  event: {
    id: string;
    title: string;
    description: string;
    startDate: string;
    startTime: string;
    endTime: string;
    location: string | null;
    isTokenGated: boolean;
  };
}

export default function EventDetails({ params }: { params: { id: string } }) {
  const { id } = params
  const wallet = useWallet()
  const [minting, setMinting] = useState(false)
  const [transactionStatus, setTransactionStatus] = useState<'pending' | 'confirmed' | null>(null)
  const queryClient = useQueryClient()

  const { data: eventData, isLoading, isError } = useQuery<EventData>({
    queryKey: ["event", id],
    queryFn: async () => {
      const res = await GetEventByID(id)
      if (res.status !== 200) {
        throw new Error("Event not found")
      }
      return res
    },
  })

  const { data: eventDetails } = useQuery({
    queryKey: ["event-details", id],
    queryFn: async () => {
      const res = await getEventDetails(id);
      if (res.status !== 200) {
        toast.error(res.message || "Failed to fetch event details");
      }
      return res;
    }
  })

  const { data: registrationData } = useQuery<RegistrationData, Error>({
    queryKey: ['registration', id],
    queryFn: async () => {
      const result = await checkEventRegistration(id);
      if (!result) {
        throw new Error('Failed to check registration');
      }
      return {
        status: result.status,
        isRegistered: result.isRegistered,
        isOrganizer: result.isOrganizer || false,
        nftDetails: result.nftDetails
      } as RegistrationData;
    }
  });

  useEffect(() => {
    if (wallet.connected && wallet.publicKey) {
      saveWalletDetails(wallet.publicKey.toBase58())
        .catch(error => {
          console.error("Failed to save wallet details:", error)
        })
    }
  }, [wallet.connected, wallet.publicKey])

  const renderTransactionStatus = () => {
    if (!transactionStatus) return null;

    return (
      <div className="mt-4 text-sm">
        {transactionStatus === 'pending' ? (
          <div className="text-yellow-400 flex items-center gap-2">
            <LoaderIcon className="w-4 h-4 animate-spin" />
            Transaction pending...
          </div>
        ) : (
          <div className="text-green-400 flex items-center gap-2">
            <CheckCircleIcon className="w-4 h-4" />
            Transaction confirmed
          </div>
        )}
      </div>
    );
  };

  const renderNFTDetails = (nftDetails: NFTDetails | null) => {
    if (!nftDetails) return null;

    return (
      <div className="mt-4 border border-gray-800 rounded-lg p-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">NFT Pass</span>
          <a
            href={`https://explorer.solana.com/address/${nftDetails.mintTXHash}?cluster=devnet`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-blue-400 hover:text-blue-300"
          >
            View on Explorer
            <ExternalLinkIcon className="w-3 h-3" />
          </a>
        </div>
        <div className="text-sm text-gray-400 mt-2">
          <p className="mb-2">Mint Address:</p>
          <code className="bg-black/30 p-2 rounded block overflow-x-auto">
            {nftDetails.mintTXHash}
          </code>
        </div>
      </div>
    );
  };

  const handleSimpleRegistration = async () => {
    try {
      const result = await JoinEvent({
        eventId: id,
        type: 'simple'
      });

      if (result.status === 200) {
        toast.success("Successfully registered for the event!")
        await queryClient.invalidateQueries({
          queryKey: ['registration', id]
        });
      } else {
        toast.error(result.message || "Failed to register for the event")
      }
    } catch (error) {
      console.error("Error registering:", error)
      toast.error("Failed to register for the event")
    }
  }

  const handleNFTRegistration = async () => {
    if (!wallet.connected || !wallet.publicKey || !wallet.signMessage || !eventData?.event) {
      toast.error("Please connect your wallet first")
      return
    }

    setMinting(true)
    setTransactionStatus('pending')
    try {
      await saveWalletDetails(wallet.publicKey.toBase58())
      const message = new TextEncoder().encode(`Verify wallet ownership for event: ${eventData.event.title}`);
      await wallet.signMessage(message);

      const result = await JoinEvent({
        eventId: id,
        type: 'nft'
      });

      if (result.status === 200 && result.nftDetails) {
        setTransactionStatus('confirmed')
        toast.success("Successfully registered for the event!")
        await queryClient.invalidateQueries({
          queryKey: ['registration', id]
        });
      } else {
        setTransactionStatus(null)
        toast.error(result.message || "Failed to register for the event")
      }
    } catch (error) {
      console.error("Error minting NFT:", error)
      toast.error(error instanceof Error ? error.message : "Failed to mint NFT ticket")
      setTransactionStatus(null)
    } finally {
      setMinting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="animate-pulse">Loading event details...</div>
      </div>
    )
  }

  if (isError || !eventData?.event) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="max-w-md w-full p-6 border border-gray-800 rounded-lg">
          <h2 className="text-xl font-medium mb-2">Event Not Found</h2>
          <p className="text-gray-400">We couldn't find the event you're looking for.</p>
        </div>
      </div>
    )
  }

  const { event } = eventData
  const eventDate = new Date(event.startDate)
  const startTime = new Date(event.startTime)
  const endTime = new Date(event.endTime)

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-[1000px] mx-auto px-6 pt-28 pb-16">
        <div className="mb-16">
          <h1 className="text-[32px] leading-tight font-normal tracking-[-0.02em] mb-8">
            {eventDetails?.title || event.title}
          </h1>

          <div className="flex items-center space-x-6 text-[15px] text-gray-300">
            <time className="flex items-center">
              <CalendarIcon className="w-[18px] h-[18px] mr-2 text-gray-500" />
              {format(eventDate, "MMMM")} {format(eventDate, "d").padStart(2, '0')}
            </time>
            <time className="flex items-center">
              <ClockIcon className="w-[18px] h-[18px] mr-2 text-gray-500" />
              {format(startTime, "h:mm a")}
            </time>
            <div className="flex items-center">
              <MapPinIcon className="w-[18px] h-[18px] mr-2 text-gray-500" />
              {eventDetails?.location || "Location TBA"}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-12">
          <div className="col-span-8">
            <div className="space-y-12">
              <div>
                <h2 className="text-[15px] font-medium uppercase tracking-wider text-gray-400 mb-4">About this event</h2>
                <div className="text-[15px] leading-relaxed text-gray-300 space-y-4">
                  {eventDetails?.description}
                </div>
              </div>
              <div>
                <h2 className="text-[15px] font-medium uppercase tracking-wider text-gray-400 mb-4">What to expect</h2>
                <div className="grid grid-cols-2 gap-6">
                  <div className="p-4 bg-gray-900/30 rounded-lg">
                    <div className="text-[15px] font-medium mb-2">Networking</div>
                    <p className="text-[14px] text-gray-400">Connect with industry professionals and like-minded individuals</p>
                  </div>
                  <div className="p-4 bg-gray-900/30 rounded-lg">
                    <div className="text-[15px] font-medium mb-2">Discussions</div>
                    <p className="text-[14px] text-gray-400">Engage in meaningful conversations about blockchain and web3</p>
                  </div>
                </div>
              </div>
              <div>
                <h2 className="text-[15px] font-medium uppercase tracking-wider text-gray-400 mb-4">Registration</h2>
                {registrationData?.isOrganizer ? (
                  <div className="space-y-4">
                    <div className="inline-flex items-center px-3 py-1.5 bg-purple-900/20 text-purple-400 text-sm rounded-full">
                      <CheckCircleIcon className="w-4 h-4 mr-1.5" />
                      You're the organizer of this event
                    </div>
                  </div>
                ) : registrationData?.isRegistered ? (
                  <div className="space-y-4">
                    <div className="inline-flex items-center px-3 py-1.5 bg-green-900/20 text-green-400 text-sm rounded-full">
                      <CheckCircleIcon className="w-4 h-4 mr-1.5" />
                      You're registered for this event
                    </div>
                    {registrationData.nftDetails && renderNFTDetails(registrationData.nftDetails)}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {eventData.event.isTokenGated ? (
                      !wallet.connected ? (
                        <div>
                          <p className="text-sm text-gray-400 mb-4">
                            This event requires an NFT pass. Please connect your wallet to register.
                          </p>
                          <WalletMultiButton className="!bg-white !text-black hover:!bg-gray-50 !rounded-full !py-2.5 !px-6 !text-sm !font-medium !transition-colors" />
                        </div>
                      ) : (
                        <div>
                          <p className="text-sm text-gray-400 mb-4">
                            Register to receive your NFT pass for this event.
                          </p>
                          <Button
                            onClick={handleNFTRegistration}
                            disabled={minting}
                            className="bg-white text-black hover:bg-gray-50 rounded-full py-2.5 px-6 text-sm font-medium transition-colors inline-flex items-center"
                          >
                            {minting ? (
                              <>
                                <LoaderIcon className="w-4 h-4 mr-2 animate-spin" />
                                Minting NFT pass...
                              </>
                            ) : (
                              "Register with NFT pass"
                            )}
                          </Button>
                          {renderTransactionStatus()}
                        </div>
                      )
                    ) : (
                      <div>
                        <Button
                          onClick={handleSimpleRegistration}
                          className="bg-white text-black hover:bg-gray-50 rounded-full py-2.5 px-6 text-sm font-medium transition-colors"
                        >
                          Register for event
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div>
                <h2 className="text-[15px] font-medium uppercase tracking-wider text-gray-400 mb-4">Additional Information</h2>
                <div className="space-y-4 text-[15px] text-gray-300">
                  <div className="p-4 bg-gray-900/30 rounded-lg">
                    <h3 className="font-medium mb-2">Event Format</h3>
                    <p className="text-gray-400">This is an in-person event. Your NFT ticket will be required for entry.</p>
                  </div>
                  <div className="p-4 bg-gray-900/30 rounded-lg">
                    <h3 className="font-medium mb-2">What to bring</h3>
                    <p className="text-gray-400">Please ensure you have your wallet connected to display your NFT ticket at the venue.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-span-4">
            <div className="sticky top-8 space-y-8">
              <div className="p-6 bg-gray-900/30 rounded-lg">
                <h2 className="text-[15px] font-medium uppercase tracking-wider text-gray-400 mb-4">Host</h2>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-800 overflow-hidden">
                    <img
                      src={eventDetails?.hostedByImage as string}
                      alt={eventDetails?.hostedBy || "Host"}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <div className="font-medium text-[15px]">{eventDetails?.hostedBy || "Host"}</div>
                    <div className="text-[14px] text-gray-400 mt-1">Event Organizer</div>
                  </div>
                </div>
              </div>
              <div className="p-6 bg-gray-900/30 rounded-lg">
                <h2 className="text-[15px] font-medium uppercase tracking-wider text-gray-400 mb-4">Date and time</h2>
                <div className="space-y-1">
                  <div className="text-[15px]">{format(eventDate, "EEEE")}</div>
                  <div className="text-[15px]">{format(eventDate, "MMMM")} {format(eventDate, "d").padStart(2, '0')}, {format(eventDate, "yyyy")}</div>
                  <div className="text-[15px] text-gray-400">{format(startTime, "h:mm a")} - {format(endTime, "h:mm a")}</div>
                </div>
              </div>
              <div className="p-6 bg-gray-900/30 rounded-lg">
                <h2 className="text-[15px] font-medium uppercase tracking-wider text-gray-400 mb-4">Location</h2>
                <div className="text-[15px]">
                  {eventDetails?.location || "Location TBA"}
                </div>
              </div>
              <div className="p-6 bg-gray-900/30 rounded-lg">
                <h2 className="text-[15px] font-medium uppercase tracking-wider text-gray-400 mb-4">Quick Info</h2>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-[14px]">
                    <span className="text-gray-400">Event Type</span>
                    <span>In Person</span>
                  </div>
                  <div className="flex items-center justify-between text-[14px]">
                    <span className="text-gray-400">Capacity</span>
                    <span>Limited</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
