import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";


const switzer = localFont({
  src: "./Switzer-Variable.ttf"
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
    <html lang="en">
      <body
        className={`${switzer.className} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
