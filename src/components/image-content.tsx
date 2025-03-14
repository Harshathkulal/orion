"use client";

import React from "react";
import Image from "next/image";

interface ImageContentProps {
  initial: boolean;
  loading: boolean;
  error: string | null;
  imageUrl: string | null;
}

export default function ImageContent({
  initial,
  loading,
  error,
  imageUrl,
}: ImageContentProps) {
  return (
    <div className="flex-1 p-4">
      {initial ? (
        <div className="h-full flex items-center justify-center text-center">
          <p className="text-muted-foreground">
            Enter a prompt to generate an image
          </p>
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
        <div className="h-full flex items-center justify-center">
          <Image
            src={imageUrl}
            alt="Generated image"
            className="max-w-full max-h-full object-contain rounded-md"
            width={512}
            height={512}
          />
        </div>
      ) : (
        <div className="h-full flex items-center justify-center text-center">
          <p className="text-muted-foreground">No image generated yet</p>
        </div>
      )}
    </div>
  );
}
