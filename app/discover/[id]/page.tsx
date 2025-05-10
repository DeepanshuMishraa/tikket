"use client"

import { GetEventByID, JoinEvent, saveWalletDetails } from "@/actions/actions"
import { useQuery } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import { MapPinIcon, ChevronRightIcon, XIcon, TwitterIcon, GlobeIcon, ExternalLinkIcon, LoaderIcon, CheckCircleIcon } from "lucide-react"
import { useConnection, useWallet } from "@solana/wallet-adapter-react"
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui"
import { useState, useEffect } from "react"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import bs58 from "bs58"

interface NFTDetails {
  mint: string;
  metadata: string;
  explorerLink: string;
}

export default function EventDetails({ params }: { params: { id: string } }) {
  const { id } = params
  const { connection } = useConnection()
  const wallet = useWallet()
  const [minting, setMinting] = useState(false)
  const [registered, setRegistered] = useState(false)
  const [nftDetails, setNftDetails] = useState<NFTDetails | null>(null)
  const [transactionStatus, setTransactionStatus] = useState<'pending' | 'confirmed' | null>(null)

  const { isLoading, isError, data } = useQuery({
    queryKey: ["event", id],
    queryFn: async () => {
      const res = await GetEventByID(id)
      if (res.status !== 200) {
        throw new Error("Event not found")
      }
      return res
    },
  })

  // Save wallet details when connected
  useEffect(() => {
    if (wallet.connected && wallet.publicKey) {
      saveWalletDetails(wallet.publicKey.toBase58())
        .catch(error => {
          console.error("Failed to save wallet details:", error)
        })
    }
  }, [wallet.connected, wallet.publicKey])

  const handleMintNFT = async () => {
    if (!wallet.connected || !data?.event || !wallet.publicKey || !wallet.signMessage) {
      toast.error("Please connect your wallet first")
      return
    }

    setMinting(true)
    setTransactionStatus('pending')
    try {
      // First save wallet details if not already saved
      await saveWalletDetails(wallet.publicKey.toBase58())

      // Sign message to verify wallet ownership
      const message = new TextEncoder().encode(`Verify wallet ownership for event: ${data.event.title}`);
      await wallet.signMessage(message);

      const result = await JoinEvent({
        eventId: id,
      });

      if (result.status === 200 && result.nftDetails) {
        setTransactionStatus('confirmed')
        toast.success("Successfully registered for the event!")
        setRegistered(true)
        setNftDetails({
          mint: result.nftDetails.mint,
          metadata: result.nftDetails.metadata,
          explorerLink: result.nftDetails.explorerLink
        })
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

  if (isError || !data?.event) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="max-w-md w-full p-6 border border-gray-800 rounded-lg">
          <h2 className="text-xl font-medium mb-2">Event Not Found</h2>
          <p className="text-gray-400">We couldn't find the event you're looking for.</p>
        </div>
      </div>
    )
  }

  const { event } = data
  const eventDate = new Date(event.startDate)
  const startTime = new Date(event.startTime)
  const endTime = new Date(event.endTime)

  const renderTransactionStatus = () => {
    if (!transactionStatus) return null;

    return (
      <div className="flex items-center gap-2 text-sm">
        {transactionStatus === 'pending' ? (
          <>
            <LoaderIcon className="w-4 h-4 animate-spin text-white" />
            <span>Minting your NFT ticket...</span>
          </>
        ) : (
          <>
            <CheckCircleIcon className="w-4 h-4 text-green-400" />
            <span>NFT minted successfully!</span>
          </>
        )}
      </div>
    );
  };

  const renderNFTDetails = () => {
    if (!nftDetails) return null;

    return (
      <div className="mt-4 space-y-4">
        <div className="bg-gray-800/50 p-4 rounded-lg">
          <h4 className="text-sm font-medium mb-3">Your NFT Ticket Details</h4>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Token Address</span>
              <a
                href={nftDetails.explorerLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-blue-400 hover:text-blue-300"
              >
                {nftDetails.mint.slice(0, 8)}...{nftDetails.mint.slice(-8)}
                <ExternalLinkIcon className="w-3 h-3" />
              </a>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Status</span>
              <span className="text-green-400">Confirmed</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-black mt-18 text-white">
      <div className="max-w-6xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-5 gap-12">
        {/* Event Card - Left Side */}
        <div className="md:col-span-2 flex flex-col">
          <div className="bg-[#0a0a5e] p-8 rounded-lg flex flex-col h-full">
            <div className="text-center mb-4">
              <div className="flex items-center justify-center">
                <img src="https://images.lumacdn.com/cdn-cgi/image/format=auto,fit=cover,dpr=2,background=white,quality=75,width=280,height=280/event-covers/6s/2d94b29a-676a-44ed-80ed-53780cb50dca.png" alt="Event Cover" className="h-20" />
              </div>
            </div>

            {/* Location information */}
            <div className="text-center mb-4">
              {event.location && (
                <div className="text-white">
                  <MapPinIcon className="w-4 h-4 inline mr-1" />
                  {event.location}
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 space-y-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-[#0a0a5e] rounded-md flex items-center justify-center text-xs text-white">
                <img
                  src="/placeholder.svg?height=40&width=40"
                  alt="Air Street"
                  className="w-full h-full object-cover rounded-md"
                />
              </div>
              <div>
                <div className="text-gray-400 text-sm">Presented by</div>
                <div className="flex items-center space-x-1">
                  <span>Air Street events</span>
                  <ChevronRightIcon className="w-4 h-4" />
                </div>
              </div>
            </div>

            <p className="text-sm text-gray-400">
              AI events around the world organized by Air Street Capital and Nathan Benaich.
            </p>

            <div className="flex space-x-3">
              <TwitterIcon className="w-5 h-5" />
              <GlobeIcon className="w-5 h-5" />
            </div>

            <div>
              <h3 className="text-lg font-medium mb-4">Hosted By</h3>
              <Separator className="my-4 bg-gray-800" />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-gray-700 overflow-hidden">
                      <img
                        src="/placeholder.svg?height=32&width=32"
                        alt="Nathan Benaich"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <span>Nathan Benaich (Air Street)</span>
                  </div>
                  <XIcon className="w-5 h-5" />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-gray-700 overflow-hidden">
                      <img
                        src="/placeholder.svg?height=32&width=32"
                        alt="Faris Sbahi"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <span>Faris Sbahi</span>
                  </div>
                  <XIcon className="w-5 h-5" />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-gray-700 overflow-hidden">
                      <img
                        src="/placeholder.svg?height=32&width=32"
                        alt="Chloe Glasgow"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <span>Chloe Glasgow</span>
                  </div>
                  <XIcon className="w-5 h-5" />
                </div>
              </div>

              <div className="mt-6 space-y-2">
                <button className="text-gray-400 hover:text-white text-sm">Contact the Host</button>
                <div className="h-px bg-gray-800"></div>
                <button className="text-gray-400 hover:text-white text-sm">Report Event</button>
              </div>
            </div>
          </div>
        </div>

        {/* Event Details - Right Side */}
        <div className="md:col-span-3 space-y-8">
          <div className="flex items-center space-x-2 text-sm text-gray-400">
            <div className="bg-teal-500/20 text-teal-400 p-1 rounded">
              <GlobeIcon className="w-4 h-4" />
            </div>
            <span>Featured in New York</span>
            <ChevronRightIcon className="w-4 h-4" />
          </div>

          <div>
            <h1 className="text-3xl font-bold mb-2">{event.title}</h1>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start gap-3">
              <div className="bg-gray-800 p-2 rounded-md flex flex-col items-center justify-center min-w-14">
                <div className="text-xs text-gray-400 uppercase">MAY</div>
                <div className="text-xl font-bold">{format(eventDate, "d")}</div>
              </div>
              <div>
                <div>{format(eventDate, "EEEE, MMMM d")}</div>
                <div className="text-gray-400">
                  {format(startTime, "h:mm a")} - {format(endTime, "h:mm a")} EDT
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="bg-gray-800 p-2 rounded-md">
                <MapPinIcon className="w-5 h-5 text-gray-400" />
              </div>
              <div>
                <div>Register to See Address</div>
                <div className="text-gray-400">New York, New York</div>
              </div>
            </div>
          </div>

          <div className="bg-gray-900 rounded-lg p-6">
            <h3 className="text-lg font-medium mb-4">Registration</h3>
            <div className="flex items-center gap-2 mb-4">
              <div className="p-1 bg-gray-800 rounded">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-ticket"
                >
                  <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
                  <path d="M13 5v2" />
                  <path d="M13 17v2" />
                  <path d="M13 11v2" />
                </svg>
              </div>
              <span className="font-medium">Event Full</span>
            </div>
            <div className="text-sm text-gray-300 mb-4">
              {registered
                ? "You've successfully registered for this event."
                : "If you'd like, you can join the waitlist."}
            </div>

            <div className="space-y-4">
              {registered ? (
                <div className="bg-green-900/20 border border-green-800 rounded-lg p-4">
                  <div className="text-green-400 font-medium mb-2">Successfully registered!</div>
                  <p className="text-sm text-gray-300">Your NFT ticket has been minted to your wallet.</p>
                  {renderNFTDetails()}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row gap-4">
                    {!wallet.connected ? (
                      <WalletMultiButton className="!bg-white !text-black hover:!bg-gray-200 !rounded-lg !font-medium !py-2 !border-none !w-full sm:!w-auto" />
                    ) : (
                      <Button
                        onClick={handleMintNFT}
                        disabled={minting}
                        className="bg-white text-black hover:bg-gray-200 rounded-lg font-medium py-2 w-full sm:w-auto"
                      >
                        {minting ? "Minting NFT Ticket..." : "Join Event"}
                      </Button>
                    )}
                  </div>
                  {renderTransactionStatus()}
                </div>
              )}
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">About Event</h2>
            <p className="text-gray-300 leading-relaxed">
              Join us for an after work happy hour with the NYC AI community, Normal Computing and Air Street Capital.
            </p>
            <p className="text-gray-300 leading-relaxed mt-4">
              Please RSVP here and we'll email you once we confirm your spot. Venue in Chelsea.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
