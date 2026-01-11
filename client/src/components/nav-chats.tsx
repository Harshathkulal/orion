"use client";

import { MoreHorizontal, Trash2 } from "lucide-react";
import Link from "next/link";

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
import { Skeleton } from "@/components/ui/skeleton";

type Conversations = {
  id: string;
  title: string;
  type: string;
  updatedAt: Date;
};

export function NavChats({
  conversations,
  conversationLoading,
}: {
  readonly conversations: readonly Conversations[] | null;
  readonly conversationLoading: boolean;
}) {
  const { isMobile } = useSidebar();

  if (conversationLoading) {
    return (
      <SidebarGroup className="group-data-[collapsible=icon]:hidden">
        <SidebarGroupLabel>Chats</SidebarGroupLabel>
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex flex-col space-y-5 p-2">
              <Skeleton className="h-[12px] w-[200px] rounded-sm" />
              <Skeleton className="h-[12px] w-[200px] rounded-sm" />
              <Skeleton className="h-[12px] w-[200px] rounded-sm" />
              <Skeleton className="h-[12px] w-[200px] rounded-sm" />
              <Skeleton className="h-[12px] w-[200px] rounded-sm" />
              <Skeleton className="h-[12px] w-[200px] rounded-sm" />
              <Skeleton className="h-[12px] w-[200px] rounded-sm" />
              <Skeleton className="h-[12px] w-[200px] rounded-sm" />
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroup>
    );
  }

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>Chats</SidebarGroupLabel>

      <SidebarMenu>
        {conversations?.length === 0 ? (
          <SidebarMenuItem>
            <SidebarMenuButton disabled className="cursor-default">
              <span className="text-xs text-muted-foreground">
                No chats yet
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ) : (
          conversations?.map((chat) => (
            <SidebarMenuItem key={chat.id}>
              {/* Chat button with navigation */}
              <SidebarMenuButton asChild tooltip={chat.title}>
                <Link href={`/chat/${chat.id}`}>
                  <span className="truncate">{chat.title}</span>
                </Link>
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
