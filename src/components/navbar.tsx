"use client";

import Link from "next/link";
import { useAuth, useUser, useClerk } from "@clerk/nextjs";
import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import {
  LogIn,
  LogOut,
  MessageSquare,
  Image as ImageIcon,
  Loader2,
  Settings,
  FileUp,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { Button } from "./ui/button";

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
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-xl font-bold hover:text-primary transition-colors">
            Orion
          </Link>
        </div>

        <div className="flex items-center gap-4 md:gap-8">
          <nav className="hidden md:flex items-center gap-4">
            <Link
              href="/chat"
              className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
                pathname === "/chat"
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted"
              }`}
            >
              <MessageSquare size={18} />
              <span>Text</span>
            </Link>

            <Link
              href="/image"
              className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
                pathname === "/image"
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted"
              }`}
            >
              <ImageIcon size={18} />
              <span>Image</span>
            </Link>
            <Link
              href="/rag"
              className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
                pathname === "/rag"
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted"
              }`}
            >
              <FileUp size={18} />
              <span>RAG</span>
            </Link>
          </nav>

          <div className="flex items-center">
            {!isLoaded ? (
              <Loader2
                size={24}
                className="animate-spin text-muted-foreground"
              />
            ) : isSignedIn ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-full"
                >
                  <Image
                    src={
                      user?.externalAccounts[0].imageUrl ||
                      user?.imageUrl ||
                      "avatar"
                    }
                    alt="Profile"
                    width={32}
                    height={32}
                    className="w-8 h-8 rounded-full object-cover ring-2 ring-primary/10"
                  />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 w-56 mt-2 bg-background border rounded-md shadow-lg py-1 ring-1 ring-black/5 focus:outline-none">
                    <div className="flex items-center gap-3 px-4 py-3 border-b">
                      <Image
                        src={
                          user?.externalAccounts[0].imageUrl ||
                          user?.imageUrl ||
                          "avatar"
                        }
                        alt="Profile"
                        width={32}
                        height={32}
                        className="w-8 h-8 rounded-full object-cover ring-2 ring-primary/10"
                      />
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">
                          {user?.firstName}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {user?.emailAddresses[0].emailAddress}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1 px-2 py-2">
                      <Button
                        onClick={() => {}}
                        variant="ghost"
                        className="w-full justify-start text-sm h-9"
                      >
                        <Settings size={16} className="mr-2" />
                        <span>Manage account</span>
                      </Button>

                      <Button
                        onClick={handleSignOut}
                        variant="ghost"
                        className="w-full justify-start text-sm h-9 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50"
                      >
                        <LogOut size={16} className="mr-2" />
                        <span>Sign out</span>
                      </Button>
                    </div>
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
