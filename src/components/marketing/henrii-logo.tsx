interface MarketingLogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "wordmark" | "logomark" | "both";
  className?: string;
}

const sizeMap: Record<NonNullable<MarketingLogoProps["size"]>, { logomark: number; wordmark: number }> = {
  sm: { logomark: 26, wordmark: 20 },
  md: { logomark: 34, wordmark: 24 },
  lg: { logomark: 42, wordmark: 30 },
  xl: { logomark: 52, wordmark: 38 },
};

const pink = "#F8B4C8";
const blue = "#B4D8F8";

function Logomark({ size }: { size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect x="22" y="16" width="4" height="34" rx="2" fill={pink} />
      <circle cx="24" cy="10" r="6" fill={pink} />
      <rect x="34" y="22" width="4" height="28" rx="2" fill={blue} />
      <circle cx="36" cy="15" r="4" fill={blue} />
    </svg>
  );
}

function Wordmark({ height }: { height: number }) {
  return (
    <span
      className="font-heading font-semibold tracking-tight leading-none text-foreground"
      style={{ fontSize: height }}
    >
      <span>henr</span>
      <span style={{ color: pink }}>i</span>
      <span style={{ color: blue }}>i</span>
    </span>
  );
}

export function MarketingLogo({
  size = "md",
  variant = "wordmark",
  className = "",
}: MarketingLogoProps) {
  const s = sizeMap[size];

  return (
    <span className={`inline-flex items-center gap-2 ${className}`} style={{ lineHeight: 1 }}>
      {(variant === "logomark" || variant === "both") ? (
        <Logomark size={s.logomark} />
      ) : null}
      {(variant === "wordmark" || variant === "both") ? (
        <Wordmark height={s.wordmark} />
      ) : null}
    </span>
  );
}

export default MarketingLogo;
