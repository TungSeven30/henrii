"use client";

import { useState } from "react";
import type { CSSProperties } from "react";

type SafeImageProps = {
  src: string;
  fallbackSrc: string;
  alt: string;
  className?: string;
  loading?: "lazy" | "eager";
  style?: CSSProperties;
};

export function SafeImage({
  src,
  fallbackSrc,
  alt,
  className,
  loading = "lazy",
  style,
}: SafeImageProps) {
  const [source, setSource] = useState(src);

  return (
    <img
      src={source}
      alt={alt}
      className={className}
      loading={loading}
      style={style}
      onError={() => setSource(fallbackSrc)}
    />
  );
}
