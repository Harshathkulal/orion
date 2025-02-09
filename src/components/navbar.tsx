"use client";
import Link from "next/link";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full bg-background">
      <div className="container flex items-center justify-between h-16 mx-auto">
        <Link href="/" className="text-xl font-bold hover:text-gray-300 px-6">
          Orion
        </Link>
      </div>
    </header>
  );
}
