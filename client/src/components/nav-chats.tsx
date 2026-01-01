"use client";

import { MoreHorizontal, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuAction,
  useSidebar,
} from "@/components/ui/sidebar";

type Chat = {
  id: string;
  title: string;
};

export function NavChats({
  chats,
}: {
  readonly chats: readonly Chat[] | null;
}) {
  const { isMobile } = useSidebar();

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>Chats</SidebarGroupLabel>

      <SidebarMenu>
        {chats?.length === 0 ? (
          <SidebarMenuItem>
            <SidebarMenuButton disabled className="cursor-default">
              <span className="text-xs text-muted-foreground">
                No chats yet
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ) : (
          chats?.map((chat) => (
            <SidebarMenuItem key={chat.id}>
              {/* Chat button */}
              <SidebarMenuButton tooltip={chat.title}>
                <span className="truncate">{chat.title}</span>
              </SidebarMenuButton>

              {/* Three dots menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuAction showOnHover>
                    <MoreHorizontal />
                    <span className="sr-only">More</span>
                  </SidebarMenuAction>
                </DropdownMenuTrigger>

                <DropdownMenuContent
                  className="w-40 rounded-lg"
                  side={isMobile ? "bottom" : "right"}
                  align={isMobile ? "end" : "start"}
                >
                  <DropdownMenuItem className="text-destructive">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          ))
        )}
      </SidebarMenu>
    </SidebarGroup>
  );
}
