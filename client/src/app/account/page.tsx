"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Mail,
  BadgeCheck,
  Calendar,
  MessageSquare,
  FileText,
  Layers,
  Image as ImageIcon,
} from "lucide-react";

import { getAccountStats, AccountResponse } from "@/services/account.service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth/use-session";

export default function AccountPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [data, setData] = useState<AccountResponse | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await getAccountStats();
        setData(res);
      } catch {
        toast.error("Failed to load account stats");
      }
    })();
  }, []);

  return (
    <div className="max-w-3xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-semibold">Account</h1>
      </div>

      {/* Profile */}
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          {data === null ? (
            <>
              <Skeleton className="h-10 w-10 rounded-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-4 w-1/2" />
            </>
          ) : (
            <>
              <div className="flex items-center gap-4">
                <Avatar>
                  <AvatarImage src={user?.image ?? ""} />
                  <AvatarFallback>
                    {data.profile.email[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div className="text-muted-foreground">
                  {data.profile.email}
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  Email
                </span>
                <span>{data.profile.email}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <BadgeCheck className="h-4 w-4" />
                  Verified
                </span>
                <span>{data.profile.emailVerified ? "Yes" : "No"}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  Joined
                </span>
                <span>
                  {new Date(data.profile.joinedAt).toLocaleDateString()}
                </span>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Usage */}
      <Card>
        <CardHeader>
          <CardTitle>Usage</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4 text-sm">
          {data === null ? (
            <>
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
            </>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <MessageSquare className="h-4 w-4" />
                  Conversations
                </span>
                <span className="font-medium">
                  {Number(data.usage.conversations)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <FileText className="h-4 w-4" />
                  Documents
                </span>
                <span className="font-medium">
                  {Number(data.usage.documents)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <Layers className="h-4 w-4" />
                  Chunks
                </span>
                <span className="font-medium">{Number(data.usage.chunks)}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <ImageIcon className="h-4 w-4" />
                  Images
                </span>
                <span className="font-medium">{Number(data.usage.images)}</span>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
