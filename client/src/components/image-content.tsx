"use client";

import React from "react";
import Image from "next/image";
import { Button } from "./ui/button";
import { ImageContentProps } from "@/types/types";

export default function ImageContent({
  initial,
  loading,
  error,
  imageUrl,
}: ImageContentProps) {
  // Handle image download
  const handleDownload = () => {
    if (imageUrl) {
      const link = document.createElement("a");
      link.href = imageUrl;
      link.download = `generated-image-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="flex-1 p-4 pt-8">
      {initial ? (
        <div className="h-full flex items-center justify-center text-center pt-14">
          <div>
            <h1 className="text-2xl font-semibold mb-2">
              Welcome to Image Gen!
            </h1>
            <p className="text-primary/60">
              Enter a prompt to generate an image
            </p>
          </div>
        </div>
      ) : loading ? (
        <div className="h-full flex items-center justify-center">
          <p className="text-muted-foreground">Generating image...</p>
        </div>
      ) : error ? (
        <div className="h-full flex items-center justify-center text-center">
          <p className="text-red-500">{error}</p>
        </div>
      ) : imageUrl ? (
        <div className="h-full flex flex-col items-center justify-center gap-4 ">
          <Image
            src={imageUrl}
            alt="Generated image"
            className="max-w-full max-h-full object-contain rounded-md"
            width={350}
            height={350}
          />
          <Button onClick={handleDownload}>Download Image</Button>
        </div>
      ) : (
        <div className="h-full flex items-center justify-center text-center">
          <p className="text-muted-foreground">No image generated yet</p>
        </div>
      )}
    </div>
  );
}
