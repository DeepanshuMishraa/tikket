'use client';
import Link from "next/link";
import TikketIcon from "./icons/ticketIcon";
import { Button } from "./ui/button";
import { ArrowUpRight, CompassIcon, VideoIcon } from "lucide-react";
import {
  WalletMultiButton,
} from "@solana/wallet-adapter-react-ui";

import "@solana/wallet-adapter-react-ui/styles.css";
import "../app/wallet.css";

import { signIn, signOut, useSession } from "@/lib/auth.client";
import { usePathname, useRouter } from "next/navigation";
import { saveWalletDetails } from "@/actions/actions";
import { useWallet } from "@solana/wallet-adapter-react";
import { useEffect, useRef } from "react";

export default function Appbar() {


  const { data: session } = useSession();
  const router = useRouter()
  const pathName = usePathname();
  const { publicKey, connected } = useWallet();
  const hasSaved = useRef(false);

  useEffect(() => {
    if (connected && publicKey && !hasSaved.current) {
      hasSaved.current = true;
      (async () => {
        try {
          await saveWalletDetails(publicKey.toBase58());
          console.log("Details saved 🧾");
        } catch (error) {
          console.error("Failed to save wallet details 💥", error);
        }
      })();
    }
  }, [connected, publicKey]);
  return (

    <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-2xl">
      <div className="max-w-7xl mx-auto flex items-center justify-between p-4">
        <div className="flex  items-center gap-20">
          <Link
            href="/"
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <TikketIcon />
            <span className="font-semibold text-white">Tikket</span>
          </Link>
          {pathName != "/" && (
            <div className="flex items-center gap-8 text-sm text-gray-300 justify-center">
              <Link href="/events" className="flex items-center justify-center gap-2">
                <VideoIcon size={16} className="text-gray-300 hover:text-white transition-colors" />
                Events
              </Link>

              <Link href="/discover" className="flex items-center justify-center gap-2">
                <CompassIcon size={16} className="text-gray-300 hover:text-white transition-colors" />
                Discover
              </Link>
            </div>
          )}
        </div>

        <div className="flex items-center gap-6">
          <Link
            href="/events"
            className={pathName === "/events" ? 'ext-sm text-gray-300 hover:text-white transition-colors hidden items-center gap-1' : 'ext-sm text-gray-300 hover:text-white transition-colors flex items-center gap-1'}
          >
            Explore Events
            <ArrowUpRight size={16} className="transition-transform group-hover:translate-x-0.5" />
          </Link>
          {session?.user ? (

            <Button
              onClick={async () => {
                await signOut({
                  fetchOptions: {
                    onSuccess: () => {
                      router.push("/");
                    }
                  }
                })
              }}
              variant="outline"
              size="sm"
              className="rounded-xl bg-gray-800 border-none hover:bg-gray-900 duration-300 text-gray-100"
            >
              Sign out
            </Button>
          ) : (
            <Button
              onClick={async () => {
                await signIn.social({
                  provider: "google",
                })
              }}
              variant="outline"
              size="sm"
              className="rounded-xl bg-gray-800 border-none hover:bg-gray-900 duration-300 text-gray-100"
            >
              Sign in
            </Button>
          )}
          <WalletMultiButton onClick={async () => {
            await saveWalletDetails(publicKey?.toBase58());
            console.log("Details saved")
          }} className="!py-0" />
        </div>
      </div>
    </nav>

  )
}
