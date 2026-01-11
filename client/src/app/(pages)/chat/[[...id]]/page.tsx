"use client";

import BaseChat from "@/components/base-chat";
import { useParams } from "next/navigation";

export default function ChatPage() {
  const params = useParams();

  const conversationId = Array.isArray(params?.id) ? params.id[0] : null;

  return (
    <div
      id="chat"
      className="relative flex min-w-0 flex-1 flex-col
      -translate-y-[calc(env(safe-area-inset-bottom,0px)/2)]
      pt-[calc(env(safe-area-inset-bottom,0px)/2)]"
    >
      <div className="flex-1 min-h-0 relative">
        <div className="absolute inset-0 overflow-y-auto">
          <BaseChat apiEndpoint="text" conversationId={conversationId} />
        </div>
      </div>
    </div>
  );
}
