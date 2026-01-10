"use client";

import { useAuth } from "@/lib/auth/use-session";
import { redirect } from "next/navigation";

export default function AuthLayout({
  children,
}: {
  readonly children: React.ReactNode;
}) {
  const { isAuthenticated, isPending } = useAuth();

  if (isPending)
    return (
      <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/60 backdrop-blur-sm">
        <span className="animate-spin h-6 w-6 rounded-full border-2 border-muted-foreground border-t-transparent" />
        <span className="ml-2 text-muted-foreground text-sm">Loading...</span>
      </div>
    );

  if (isAuthenticated) {
    redirect("/");
  }

  return <>{children}</>;
}
