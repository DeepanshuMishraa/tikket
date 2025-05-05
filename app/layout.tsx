import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import Appbar from "@/components/Appbar";
import Footer from "@/components/footer";
import QueryProvider, { SolanaProviders } from "./providers";
import { Toaster } from "@/components/ui/sonner";


const pop = Poppins({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700"],
  variable: "--font-poppins",
})

export const metadata: Metadata = {
  title: "Tikket | Web3 Event Access Redefined",
  description: "Tikket is the modern way to RSVP to events using your wallet. Get soulbound NFT passes, claim rewards, and verify real attendance — all on Solana.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${pop.className} antialiased min-h-[100svh] relative
        bg-gradient-to-b from-[#0a0a0a] via-[#111111] to-[#040404]
        before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_center,rgba(89,0,255,0.08),transparent_50%)] before:blur-2xl before:pointer-events-none
        after:absolute after:inset-0 after:bg-[radial-gradient(circle_at_center,rgba(255,0,255,0.07),transparent_50%)] after:blur-2xl after:pointer-events-none`}
      >
        <SolanaProviders>
          <QueryProvider>
            <main className="flex flex-col min-h-[100svh]">
              <Appbar />
              {children}
              <Footer />
            </main>
            <Toaster theme="dark" />
          </QueryProvider>
        </SolanaProviders>

      </body>
    </html>
  );
}
