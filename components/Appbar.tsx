import Link from "next/link";
import TikketIcon from "./icons/ticketIcon";
import { Button } from "./ui/button";
import { ArrowUpRight } from "lucide-react";

export default function Appbar() {
  return (
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

          <Button
            variant="outline"
            size="sm"
            className="rounded-xl bg-gray-800 border-none hover:bg-gray-900 duration-300 text-gray-100"
          >
            Sign in
          </Button>

          <Button
            size="sm"
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            Connect Wallet
          </Button>
        </div>
      </div>
    </nav>
  )
}
