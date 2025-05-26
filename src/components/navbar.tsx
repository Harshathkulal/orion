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
             <Link
              href="/rag"
              className={`flex items-center gap-2 px-2 py-1 rounded-md ${
                pathname === "/rag"
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted"
              }`}
            >
              <FileUp size={18} />
              <span>RAG</span>
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
                    src={
                      user?.externalAccounts[0].imageUrl ||
                      user?.imageUrl ||
                      "avatar"
                    }
                    alt="Profile"
                    width={32}
                    height={32}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 w-52 mt-2 bg-background border border-gray-200 rounded-md shadow-lg py-1">
                    <div className="flex items-center gap-2 px-4 py-2 border-b border-gray-200">
                      <Image
                        src={
                          user?.externalAccounts[0].imageUrl ||
                          user?.imageUrl ||
                          "avatar"
                        }
                        alt="Profile"
                        width={20}
                        height={20}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold">
                          {user?.firstName}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {user?.emailAddresses[0].emailAddress}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1 px-2 py-1">
                      <Button
                        onClick={() => {}}
                        variant="outline"
                        className="px-1 py-0.5 text-xs h-6 flex items-center gap-1"
                      >
                        <Settings size={12} />
                        <span>Manage account</span>
                      </Button>

                      <Button
                        onClick={handleSignOut}
                        variant="outline"
                        className="px-1 py-0.5 text-xs h-6 flex items-center gap-1"
                      >
                        <LogOut size={12} />
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
