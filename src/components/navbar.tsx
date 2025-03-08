"use client";

import Link from "next/link";
import { useAuth, useUser, useClerk } from "@clerk/nextjs";
import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { LogIn } from "lucide-react";

export default function Navbar() {
  const { isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();
  const { signOut } = useClerk();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
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
        <Link href="/" className="text-xl font-bold hover:text-gray-300 px-6">
          Orion
        </Link>
        
        <div className="px-6">
          {isLoaded && (
            isSignedIn ? (
              <div className="relative" ref={dropdownRef}>
                <button 
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center focus:outline-none"
                >
                  <Image src={user?.imageUrl || '/default-avatar.png'} 
                    alt="Profile" width={32} height={32}
                    className="w-8 h-8 rounded-full object-cover"/>
                  
                </button>
                
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-background border border-gray-200 rounded-md shadow-lg py-1">
                    <button
                      onClick={handleSignOut}
                      className="w-full text-left px-4 py-2 text-sm focus:outline-none"
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
            )
          )}
        </div>
      </div>
    </header>
  );
}