"use client";
import { AppSidebar } from "@/components/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { redirect } from "next/navigation";
import { useAuth } from "@/lib/auth/use-session";

export default function Layout({
  children,
}: {
  readonly children: React.ReactNode;
}) {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return redirect("/login");
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        {/* header */}
        <header className="flex h-14 items-center gap-2 border-b px-4 justify-between">
          <SidebarTrigger />
          <Link href="/">Orion</Link>
        </header>

        {/* Route content */}
        <main className="flex flex-1 flex-col p-4">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
