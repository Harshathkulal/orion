"use client";

import Link from "next/link";
import MobileSidebar from "./MobileSidebar";
import { useState } from "react";

export default function SidebarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex min-h-screen">
      {/* Sidebar (used for both mobile & desktop) */}
      <MobileSidebar open={open} setOpen={setOpen} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top bar with menu button */}
        <header className="flex items-center justify-between border-b p-3">
          <button
            onClick={() => setOpen(true)}
            className="p-2 rounded-md hover:bg-muted"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
          <div className="font-semibold text-lg">
            <Link
              href="/"
              className="text-xl font-bold hover:text-primary transition-colors"
            >
              Orion
            </Link>
          </div>
        </header>

        {/* Main Page Content */}
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
