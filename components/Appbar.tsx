'use client';
import Link from "next/link";
import TikketIcon from "./icons/ticketIcon";
import { Button } from "./ui/button";
import { ArrowUpRight } from "lucide-react";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import {
  WalletModalProvider,
  WalletMultiButton,
} from "@solana/wallet-adapter-react-ui";

import "@solana/wallet-adapter-react-ui/styles.css";
import "../app/wallet.css";
import { clusterApiUrl } from "@solana/web3.js"
import { useMemo } from "react";
import { signIn, signOut, useSession } from "@/lib/auth.client";
import { useRouter } from "next/navigation";

export default function Appbar() {

  const endpoint = clusterApiUrl("devnet");
  const wallets = useMemo(() => [], []);
  const { data: session } = useSession();
  const router = useRouter()
  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets}>
        <WalletModalProvider>
          <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-2xl">
            <div className="max-w-7xl mx-auto flex items-center justify-between p-4">
              <Link
                href="/"
                className="flex items-center gap-2 hover:opacity-80 transition-opacity"
              >
                <TikketIcon />
                <span className="font-semibold text-white">Tikket</span>
              </Link>

              <div className="flex items-center gap-6">
                <Link
                  href="/events"
                  className="text-sm text-gray-300 hover:text-white transition-colors flex items-center gap-1"
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
                        provider: "google"
                      })
                    }}
                    variant="outline"
                    size="sm"
                    className="rounded-xl bg-gray-800 border-none hover:bg-gray-900 duration-300 text-gray-100"
                  >
                    Sign in
                  </Button>
                )}
                <WalletMultiButton className="!py-0" />
              </div>
            </div>
          </nav>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  )
}
