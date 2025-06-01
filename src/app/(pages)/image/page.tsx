"use client";

import React from "react";
import BaseImage from "@/components/base-image";

export default function ImagePage() {
  return (
    <div className="flex flex-col h-[calc(100vh-64px)]">
      <div className="flex-1 min-h-0 relative">
        <div className="absolute inset-0 flex flex-col">
          <BaseImage
            apiEndpoint="/api/image"
            maxFreeMessages={3}
          />
        </div>
      </div>
    </div>
  );
}