"use client";

import Link from "next/link";
import { useAuth, useUser, useClerk } from "@clerk/nextjs";
import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import {
  LogIn,
  MessageSquare,
  Image as ImageIcon,
  Loader2,
} from "lucide-react";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const { isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();
  const { signOut } = useClerk();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSignOut = () => {
    signOut();
    setDropdownOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-background">
      <div className="container flex items-center justify-between h-16 mx-auto">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-xl font-bold hover:text-gray-300 px-2">
            Orion
          </Link>
        </div>

        <div className="px-6 flex items-center gap-8">
          <nav className="flex items-center gap-4">
            <Link
              href="/"
              className={`flex items-center gap-2 px-2 py-1 rounded-md ${
                pathname === "/"
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted"
              }`}
            >
              <MessageSquare size={18} />
              <span>Text</span>
            </Link>

            <Link
              href="/image"
              className={`flex items-center gap-2 px-2 py-1 rounded-md ${
                pathname === "/image"
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted"
              }`}
            >
              <ImageIcon size={18} />
              <span>Image</span>
            </Link>
          </nav>

          <div className="w-8 h-8 flex items-center justify-center">
            {!isLoaded ? (
              <Loader2
                size={24}
                className="animate-spin text-muted-foreground"
              />
            ) : isSignedIn ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center focus:outline-none"
                >
                  <Image
                    src={user?.imageUrl || "/default-avatar.png"}
                    alt="Profile"
                    width={32}
                    height={32}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-background border border-gray-200 rounded-md shadow-lg py-1">
                    <button
                      onClick={handleSignOut}
                      className="w-full text-left px-4 py-2 text-sm focus:outline-none hover:bg-muted"
                    >
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/login" className="hover:text-gray-300 font-medium">
                <LogIn size={24} />
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
