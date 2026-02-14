"use client";

import { useState } from "react";

type SafeImageProps = {
  src: string;
  fallbackSrc: string;
  alt: string;
  className?: string;
  loading?: "lazy" | "eager";
};

export function SafeImage({
  src,
  fallbackSrc,
  alt,
  className,
  loading = "lazy",
}: SafeImageProps) {
  const [source, setSource] = useState(src);

  return (
    <img
      src={source}
      alt={alt}
      className={className}
      loading={loading}
      onError={() => setSource(fallbackSrc)}
    />
  );
}
