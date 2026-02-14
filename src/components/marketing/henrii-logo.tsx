const MARK_SIZE_MAP = {
  sm: 24,
  md: 30,
  lg: 38,
  xl: 46,
} as const;

type MarketingLogoSize = keyof typeof MARK_SIZE_MAP;

type MarketingLogoVariant = "wordmark" | "logomark" | "both";

type MarketingLogoProps = {
  size?: MarketingLogoSize;
  variant?: MarketingLogoVariant;
  className?: string;
  showText?: boolean;
};

function MarketingLogomark({ size }: { size: MarketingLogoSize }) {
  const s = MARK_SIZE_MAP[size];
  const stroke = Math.max(3, Math.round(s * 0.08));
  const bodyH = s * 0.46;
  const bodyW = Math.max(4, Math.round(s * 0.07));
  const gap = s * 0.24;
  const leftX = s * 0.36;
  const leftY = s * 0.95;
  const rightX = leftX + gap;
  const leftDotY = s * 0.3;
  const rightDotY = s * 0.37;

  return (
    <span
      className="inline-flex shrink-0"
      style={{
        width: s,
        height: s,
      }}
      aria-hidden="true"
    >
      <svg
        width={s}
        height={s}
        viewBox={`0 0 ${s} ${s}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect
          x={leftX - bodyW / 2}
          y={leftY - bodyH}
          width={bodyW}
          height={bodyH}
          rx={bodyW / 2}
          fill="var(--foreground)"
        />
        <circle cx={leftX} cy={leftDotY} r={bodyW * 0.9} fill="var(--foreground)" />

        <rect
          x={rightX - bodyW / 2}
          y={leftY - bodyH * 0.82}
          width={bodyW}
          height={bodyH * 0.82}
          rx={bodyW / 2}
          fill="var(--henrii-blue)"
        />
        <circle cx={rightX + stroke * 0.2} cy={rightDotY} r={Math.max(2.5, bodyW * 0.65)} fill="var(--henrii-blue)" />

        <path
          d={`M${leftX - bodyW / 2 - stroke} ${leftY - bodyH * 0.34} ${leftX + bodyW / 2 + stroke} ${leftY - bodyH * 0.34}`}
          stroke="var(--foreground)"
          strokeWidth={Math.max(1.5, stroke * 0.18)}
          strokeLinecap="round"
        />
        <path
          d={`M${rightX - bodyW / 2 - stroke} ${leftY - bodyH * 0.28} ${rightX + bodyW / 2 + stroke} ${leftY - bodyH * 0.28}`}
          stroke="var(--henrii-blue)"
          strokeWidth={Math.max(1.5, stroke * 0.18)}
          strokeLinecap="round"
        />
      </svg>
    </span>
  );
}

function MarketingWordmark({ showText = true }: { showText: boolean }) {
  if (!showText) {
    return null;
  }

  return (
    <span className="inline-flex items-baseline leading-none tracking-[-0.015em]">
      <span className="font-heading text-2xl md:text-3xl font-black text-foreground">henr</span>
      <span className="relative inline-flex text-2xl md:text-3xl font-black leading-none">
        <span className="text-foreground">i</span>
        <span className="absolute left-2.5 top-[-0.03em] text-primary">i</span>
      </span>
    </span>
  );
}

export function MarketingLogo({
  size = "md",
  variant = "both",
  className,
  showText = true,
}: MarketingLogoProps) {
  return (
    <span
      className={`inline-flex items-center gap-2 ${className ?? ""}`.trim()}
      style={{ lineHeight: 1 }}
    >
      {(variant === "logomark" || variant === "both") && (
        <MarketingLogomark size={size} />
      )}
      {(variant === "wordmark" || variant === "both") && (
        <MarketingWordmark showText={showText} />
      )}
    </span>
  );
}

export default MarketingLogo;
