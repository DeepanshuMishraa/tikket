import { ChromeIcon, InstagramIcon, MailIcon, TwitterIcon } from "lucide-react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="px-6 py-4 mx-auto w-full max-w-7xl backdrop-blur-md border-t border-white/10 text-sm text-white">
      <div className="flex items-center justify-between w-full">
        <nav className="flex space-x-6">
          <Link href="/" className="font-semibold opacity-90 hover:opacity-100 transition-opacity">Tikket</Link>
          <Link href="/" className="opacity-70 hover:opacity-100 transition-opacity">What's new</Link>
          <Link href="/" className="opacity-70 hover:opacity-100 transition-opacity">Discover</Link>
          <Link href="/" className="opacity-70 hover:opacity-100 transition-opacity">Help</Link>
        </nav>
        <div className="flex items-center gap-6">
          <MailIcon size={18} className="opacity-80 hover:opacity-100 transition-opacity" />
          <ChromeIcon size={18} className="opacity-80 hover:opacity-100 transition-opacity" />
          <TwitterIcon size={18} className="opacity-80 hover:opacity-100 transition-opacity" />
          <InstagramIcon size={18} className="opacity-80 hover:opacity-100 transition-opacity" />
        </div>
      </div>
    </footer>
  );
}
