"use client";

import React from "react";
import BaseChat from "./base-chat";

export default function ChatPage() {
  return (
    <BaseChat
      apiEndpoint="/api/text"
      maxFreeMessages={3}
    />
  );
}
