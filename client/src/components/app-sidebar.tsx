"use client";

import * as React from "react";
import { Orbit } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { NavChats } from "@/components/nav-chats";
import { NavContent } from "./nav-content";
import { NavFooter } from "./nav-footer";
import { useAuth } from "@/lib/auth/use-session";
import { useConversations } from "@/hooks/useConversation";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useAuth();
  const { conversations, conversationLoading } = useConversations();
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="justify-center px-3">
        <Orbit />
      </SidebarHeader>
      <SidebarContent>
        <NavContent />
        <NavChats
          conversations={conversations}
          conversationLoading={conversationLoading}
        />
      </SidebarContent>
      <SidebarFooter>
        <NavFooter user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
