"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MessageSquare, ImageIcon } from "lucide-react";
import UserMenu from "./UserMenu";

interface SidebarProps {
  onNavigate?: () => void;
}

export default function Sidebar({ onNavigate }: SidebarProps) {
  const pathname = usePathname();

  const links = [
    { href: "/chat", label: "Chat", icon: MessageSquare },
    { href: "/image", label: "Image", icon: ImageIcon },
  ];

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center h-16 px-4 border-b font-bold text-xl">
        Orion
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {links.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
              pathname === href
                ? "bg-muted text-primary"
                : "hover:bg-muted hover:text-primary"
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        ))}
      </nav>

      <div className="border-t p-4">
        <UserMenu />
      </div>
    </div>
  );
}
