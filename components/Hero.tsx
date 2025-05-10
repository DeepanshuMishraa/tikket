import Link from "next/link";
import { AuroraText } from "./magicui/aurora-text";
import Iphone15Pro from "./magicui/iphone-15-pro";
import { Button } from "./ui/button";

export default function Hero() {
  return (
    <div className="flex items-center justify-between px-38 h-[100svh]">
      <div className="text-white max-w-2xl space-y-10 flex flex-col">
        <h1 className="text-6xl space-y-2"><span className="text-[20px] font-bold tracking-wider">Tikket</span> <br />Delightful <br />
          events <br />
          <AuroraText>start here.</AuroraText></h1>
        <p>Set up an event page, invite friends and<br /> sell tickets. Host a memorable event <br /> today.</p>

        <Link href="/events/create">        <Button variant={null} className="bg-white text-black rounded-xl hover:bg-gray-100 duration-200 cursor-pointer">Create Your First Event</Button>
        </Link>
      </div>
      <div className="">
        <Iphone15Pro src="/mock.png" width={433} height={500} />
      </div>
    </div>
  )
}
