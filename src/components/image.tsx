"use client";

import React from "react";
import BaseImage from "./base-image";

export default function ImagePage() {
  return (
    <BaseImage
      apiEndpoint="/api/image"
      maxFreeMessages={3}
    />
  );
}
