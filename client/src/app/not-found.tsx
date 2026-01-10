import Link from "next/link";
import { ArrowLeft, Orbit } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center text-center px-6 bg-gradient-to-br from-black via-mocha-950 to-black">
      {/* Logo / Name */}
      <div className="mb-6 flex items-center gap-2 text-orange-500">
        <Orbit className="h-5 w-5" />
        <span className="text-lg font-semibold tracking-wide">Orion</span>
      </div>

      {/* Main text */}
      <h1 className="text-6xl font-bold text-white mb-4">404</h1>
      <p className="text-mocha-200 max-w-md mb-8">
        This page drifted into the void.  
        The chat still remembers you though.
      </p>

      {/* Action */}
      <Link
        href="/"
        className="inline-flex items-center gap-2 rounded-lg border border-orange-500/30 px-5 py-2.5 text-sm font-medium text-orange-400 hover:bg-orange-500/10 transition"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Home
      </Link>
    </div>
  );
}
