"use client";

import { SquarePen, Search } from "lucide-react";
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

export function NavContent() {
  return (
    <SidebarGroup>
      {/* Always visible actions */}
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton tooltip="New chat">
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
