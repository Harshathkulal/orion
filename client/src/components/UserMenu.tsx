"use client";

import { useAuth } from "@/lib/auth/use-session";
import { authClient } from "@/lib/auth-client";
import Image from "next/image";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { LogOut, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function UserMenu() {
  const { user, isAuthenticated, isPending } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    const res = await authClient.signOut();
    if (res.error) return toast.error("Logout failed");
    toast.success("Logged out");
    router.push("/");
  };

  if (isPending) return null;

  if (!isAuthenticated)
    return (
      <Button
        onClick={() => router.push("/login")}
        className="w-full"
        variant="outline"
      >
        Login
      </Button>
    );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 w-full p-2 hover:bg-muted rounded-md">
          {user?.image ? (
            <Image
              src={user.image}
              alt="Profile"
              width={32}
              height={32}
              className="rounded-full"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-secondary text-primary flex items-center justify-center font-medium">
              {user?.name?.charAt(0).toUpperCase() ?? "U"}
            </div>
          )}
          <span className="text-sm font-medium truncate">{user?.name}</span>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem onClick={() => {}}>
          <Settings className="h-4 w-4 mr-2" /> Manage Account
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={handleSignOut}
          className="text-red-600 focus:text-red-700"
        >
          <LogOut className="h-4 w-4 mr-2" /> Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
