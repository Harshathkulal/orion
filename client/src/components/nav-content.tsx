"use client";

import { SquarePen, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

export function NavContent() {
  const router = useRouter();

  const handleNewChat = () => {
    router.push("/chat");
    // Force reset via event since router might not trigger update if already at /chat
    globalThis.dispatchEvent(new Event("nav-new-chat"));
  };

  return (
    <SidebarGroup>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton tooltip="New chat" onClick={handleNewChat}>
            <SquarePen />
            <span>New chat</span>
          </SidebarMenuButton>
        </SidebarMenuItem>

        <SidebarMenuItem>
          <SidebarMenuButton tooltip="Search chats">
            <Search />
            <span>Search</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  );
}
