"use client";

import React from "react";
import BaseChat from "@/components/base-chat";
import Navbar from "@/components/navbar";

export default function ChatPage() {
  return (
    <div className="flex flex-col h-screen">
      <Navbar />
      <div className="flex-1 min-h-0 relative">
        <div className="absolute inset-0 overflow-y-auto">
          <BaseChat
            apiEndpoint="/api/text"
            maxFreeMessages={3}
          />
        </div>
      </div>
    </div>
  );
}
