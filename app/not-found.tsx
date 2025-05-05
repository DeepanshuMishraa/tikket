import Link from "next/link";

export default function NotFound() {
  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-[#0a0a0a] via-[#111111] to-[#040404] text-foreground p-4 overflow-hidden">
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="w-full h-full max-w-7xl">
          <div className="relative w-full h-full">
            <div className="absolute inset-0 before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_center,rgba(89,0,255,0.08),transparent_50%)] before:pointer-events-none before:blur-2xl after:absolute after:inset-0 after:bg-[radial-gradient(circle_at_center,rgba(255,0,255,0.07),transparent_50%)] after:pointer-events-none after:blur-2xl" />
          </div>
        </div>
      </div>

      <div className="relative space-y-6 text-center">
        <h1 className="text-7xl font-bold tracking-tighter animate-aurora bg-gradient-to-b from-white via-[#666666] to-[#353535] bg-[length:200%_auto] bg-clip-text text-transparent">
          404
        </h1>
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold text-white">Page Not Found</h2>
          <p className="text-gray-300 max-w-[500px] opacity-90">
            Oops! The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>
        </div>
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-2xl text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 shadow-xs "
        >
          Return Home
        </Link>
      </div>
    </div>
  );
}
