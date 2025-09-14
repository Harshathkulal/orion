import React from "react";
import BaseChat from "@/components/base-chat";

export default function ChatPage() {
  return (
    <div id="chat" className="flex flex-col h-[calc(100vh-64px)]">
      <div className="flex-1 min-h-0 relative">
        <div className="absolute inset-0 overflow-y-auto">
          <BaseChat
            apiEndpoint="/text"
            maxFreeMessages={3}
          />
        </div>
      </div>
    </div>
  );
}
