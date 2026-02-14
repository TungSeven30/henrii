import type { SVGProps } from "react";

const baseSvgProps: SVGProps<SVGSVGElement> = {
  viewBox: "0 0 64 64",
  fill: "none",
  xmlns: "http://www.w3.org/2000/svg",
};

export function VaccinationArtwork(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...baseSvgProps} {...props}>
      <defs>
        <linearGradient
          id="vaccinationBg"
          x1="9"
          y1="10"
          x2="55"
          y2="54"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="#fef3c7" />
          <stop offset="1" stopColor="#fde68a" />
        </linearGradient>
        <linearGradient
          id="vaccinationNeedle"
          x1="28"
          y1="10"
          x2="50"
          y2="36"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="#0f172a" />
          <stop offset="1" stopColor="#1f2937" />
        </linearGradient>
      </defs>
      <path d="M32 16a14 14 0 1 0 0 28 14 14 0 0 0 0-28Z" fill="url(#vaccinationBg)" />
      <path
        d="M24 8.5h16"
        stroke="#111827"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path
        d="M32 11v7"
        stroke="#111827"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path
        d="M32 8h7a2 2 0 0 1 2 2v3h-18v-3a2 2 0 0 1 2-2h9Z"
        fill="#fbbf24"
      />
      <rect
        x="22.2"
        y="26"
        width="19.6"
        height="20.5"
        rx="9.8"
        fill="url(#vaccinationNeedle)"
        stroke="#0f172a"
        strokeWidth="2"
      />
      <path d="M29 34h6" stroke="#0f172a" strokeWidth="2.5" strokeLinecap="round" />
      <path
        d="M32 29.5v10"
        stroke="#7f1d1d"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M40 41a6 6 0 1 1-8.5-10.4"
        stroke="#ef4444"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <path
        d="M37 34c.95-1.55 2.4-2.4 2.4-4.2 0-2.5-2-4.3-4.5-4.3a4.65 4.65 0 0 0-4.1 2"
        stroke="#111827"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <circle cx="28.5" cy="28" r="1.6" fill="#14532d" />
      <circle cx="35.5" cy="28" r="1.2" fill="#14532d" />
      <circle cx="41" cy="28" r="1.4" fill="#14532d" />
    </svg>
  );
}

export function GrowthArtwork(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...baseSvgProps} {...props}>
      <defs>
        <linearGradient
          id="growthBg"
          x1="10"
          y1="13"
          x2="54"
          y2="56"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="#ede9fe" />
          <stop offset="1" stopColor="#ddd6fe" />
        </linearGradient>
        <linearGradient
          id="growthLine"
          x1="20"
          y1="45"
          x2="48"
          y2="17"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="#7c3aed" />
          <stop offset="1" stopColor="#a78bfa" />
        </linearGradient>
      </defs>
      <rect x="8" y="13" width="48" height="40" rx="5" fill="url(#growthBg)" />
      <path d="M14 49h36" stroke="#4c1d95" strokeWidth="2.5" strokeLinecap="round" />
      <path
        d="M14 49v-27M20 49v-16M26 49v-20M32 49v-13M38 49v-17M44 49v-12"
        stroke="#818cf8"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M14 36l6-7 6 4 6-9 6 6 6-13 6 7"
        fill="none"
        stroke="url(#growthLine)"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="20" cy="36" r="2.7" fill="#8b5cf6" />
      <circle cx="26" cy="29" r="2.7" fill="#a78bfa" />
      <circle cx="32" cy="40" r="2.7" fill="#8b5cf6" />
      <circle cx="38" cy="35" r="2.7" fill="#c4b5fd" />
      <circle cx="44" cy="39" r="2.7" fill="#ddd6fe" />
      <circle cx="50" cy="26" r="2.7" fill="#e0e7ff" />
      <path
        d="M42 16c-2 0-3 1.2-3.7 2.8-.9 2-.2 4.4 1.6 5.7 1.8 1.2 4.5 1 6-1 .7-1 1-2.2 1-3.2s-.4-2.2-1-3c-.9-1.2-2.2-1.3-3-.3Z"
        fill="#f9a8d4"
      />
      <circle cx="44.5" cy="18" r="1.4" fill="#111827" />
      <path d="M43.6 18.5h1.8M44.5 17.6v1.8" stroke="#111827" strokeWidth="1.2" />
    </svg>
  );
}

export function MilestoneArtwork(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...baseSvgProps} {...props}>
      <defs>
        <linearGradient
          id="milestoneBg"
          x1="9"
          y1="11"
          x2="55"
          y2="53"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="#dcfce7" />
          <stop offset="1" stopColor="#bbf7d0" />
        </linearGradient>
        <linearGradient
          id="milestoneArc"
          x1="13"
          y1="42"
          x2="51"
          y2="14"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="#22c55e" />
          <stop offset="1" stopColor="#34d399" />
        </linearGradient>
      </defs>
      <rect x="10" y="10" width="44" height="44" rx="12" fill="url(#milestoneBg)" />
      <path
        d="M14 42.5h37"
        stroke="#14532d"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        d="M14 42.5h6.5v-5M24.5 42.5h6.5v-10.5M35 42.5h6.5v-14.5M45.5 42.5h5.5v-19"
        stroke="url(#milestoneArc)"
        strokeWidth="3.8"
        strokeLinecap="round"
      />
      <circle cx="16.5" cy="46" r="2.8" fill="#22c55e" />
      <circle cx="27" cy="27.5" r="2.8" fill="#4ade80" />
      <circle cx="37.5" cy="32" r="2.8" fill="#86efac" />
      <circle cx="48" cy="23" r="2.8" fill="#bbf7d0" />
      <path
        d="M32.5 15.5a6 6 0 1 1-10.5 2.6"
        stroke="#065f46"
        strokeWidth="2.8"
        strokeLinecap="round"
      />
      <path
        d="M20 9c-1.5 2.6-.7 5.7 2.6 7.5 2.5 1.4 6.7 1.4 8.9-2.1"
        fill="none"
        stroke="#15803d"
        strokeWidth="1.8"
      />
      <g fill="#14532d">
        <path d="M48.8 14.5h-2.2l-.5-1.3-.5 1.3h-1.2l.95 1.4-.36 1.35h.98l.84-1.5.84 1.5h.98l-.35-1.35z" />
        <path d="M12.2 49.8h10v2.2h-10zM18.4 49.8h1.8v2.2h-1.8zM21.8 49.8h1.8v2.2h-1.8z" />
      </g>
      <path
        d="M14.8 42.4 24.5 36.8 33.2 41 42.1 31.6 51.2 25.8"
        fill="none"
        stroke="#166534"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export type MilestoneKey =
  | "motor.roll_over"
  | "motor.sit_without_support"
  | "motor.crawl"
  | "motor.walk_independent"
  | "language.cooing"
  | "language.babbling"
  | "language.first_word"
  | "social.social_smile"
  | "social.responds_to_name"
  | "cognitive.object_permanence";

export type MilestoneItemArtworkProps = SVGProps<SVGSVGElement> & {
  milestoneKey: string;
};

export function MilestoneItemArtwork({
  milestoneKey,
  ...props
}: MilestoneItemArtworkProps) {
  switch (milestoneKey) {
    case "motor.roll_over":
      return <RollOverArtwork {...props} />;
    case "motor.sit_without_support":
      return <SitWithoutSupportArtwork {...props} />;
    case "motor.crawl":
      return <CrawlArtwork {...props} />;
    case "motor.walk_independent":
      return <WalkIndependentArtwork {...props} />;
    case "language.cooing":
      return <CooingArtwork {...props} />;
    case "language.babbling":
      return <BabblingArtwork {...props} />;
    case "language.first_word":
      return <FirstWordArtwork {...props} />;
    case "social.social_smile":
      return <SocialSmileArtwork {...props} />;
    case "social.responds_to_name":
      return <RespondsToNameArtwork {...props} />;
    case "cognitive.object_permanence":
      return <ObjectPermanenceArtwork {...props} />;
    default:
      return <RollOverArtwork {...props} />;
  }
}

function RollOverArtwork(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...baseSvgProps} {...props}>
      <rect x="18" y="14" width="28" height="24" rx="8" fill="#fef3c7" />
      <path d="M22 26h20" stroke="#0f172a" strokeWidth="3" strokeLinecap="round" />
      <circle cx="29" cy="18" r="6" fill="#bfdbfe" />
      <path
        d="M27 15c0-2.4 2-4 4-4 1 0 2 .3 2.7 1.1"
        stroke="#0f172a"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path d="M28 23c1.2 1.9 3 3.3 5.5 3.3" stroke="#166534" strokeWidth="2.2" />
      <path d="M20 32c3.5 2.7 8 2.7 11.5 0" stroke="#0f172a" strokeWidth="2.5" />
      <path d="M32 18l4 2 5-1.5" stroke="#7c3aed" strokeWidth="2.6" fill="none" />
      <circle cx="24" cy="18" r="1.2" fill="#0f172a" />
      <circle cx="34" cy="18" r="1.2" fill="#0f172a" />
    </svg>
  );
}

function SitWithoutSupportArtwork(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...baseSvgProps} {...props}>
      <rect x="12" y="12" width="40" height="40" rx="10" fill="#dcfce7" />
      <rect
        x="19"
        y="14"
        width="26"
        height="7"
        rx="3.5"
        fill="#fef3c7"
        stroke="#0f172a"
        strokeWidth="2"
      />
      <path d="M19 21l-4 11" stroke="#0f172a" strokeWidth="3" strokeLinecap="round" />
      <circle cx="30" cy="21" r="5" fill="#a5f3fc" />
      <path
        d="M26 21h8"
        stroke="#0f172a"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path d="M29 21v9" stroke="#0f172a" strokeWidth="2" />
      <path d="M18 42h20" stroke="#15803d" strokeWidth="2.5" />
      <path d="M22 42h11" stroke="#22c55e" strokeWidth="2.8" />
      <path d="M26 34c-1.6 0-2.8 1-2.8 2.6" stroke="#0f172a" strokeWidth="2" />
    </svg>
  );
}

function CrawlArtwork(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...baseSvgProps} {...props}>
      <rect x="10" y="14" width="44" height="30" rx="10" fill="#ede9fe" />
      <path
        d="M14 34c3-6 7-11 15-11s12 5 15 11"
        stroke="#7c3aed"
        strokeWidth="2.8"
        strokeLinecap="round"
      />
      <circle cx="18" cy="20" r="5" fill="#fef08a" />
      <circle cx="32" cy="26" r="3.8" fill="#bbf7d0" />
      <circle cx="45" cy="20" r="5" fill="#fca5a5" />
      <path d="M18 20h27M21 24h4M38 24h4" stroke="#0f172a" strokeWidth="1.8" />
      <path d="M18 25c-1-1.8 0-3.8 2.5-4.5" fill="none" stroke="#0f172a" strokeWidth="1.8" />
      <path d="M45 24c1.3-1.7 0.8-3.9-1.5-4.8" fill="none" stroke="#0f172a" strokeWidth="1.8" />
      <path d="M45 28c-3 2.2-6 3.6-9.6 3.8" stroke="#0f172a" strokeWidth="1.6" />
    </svg>
  );
}

function WalkIndependentArtwork(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...baseSvgProps} {...props}>
      <rect x="11" y="20" width="42" height="22" rx="10" fill="#ffedd5" />
      <rect
        x="19"
        y="16"
        width="26"
        height="12"
        rx="6"
        fill="#fef3c7"
        stroke="#0f172a"
        strokeWidth="2"
      />
      <circle cx="30" cy="20" r="5.5" fill="#fde68a" />
      <path d="M27 19.5h6M27 22h6" stroke="#0f172a" strokeWidth="1.8" />
      <path d="M26 26l4-2 5 5 6-8" fill="none" stroke="#7c3aed" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M22 28v9M35 28v9" stroke="#0f172a" strokeWidth="2" strokeLinecap="round" />
      <path d="M22 36l-2 6M35 36l3 6" stroke="#0f172a" strokeWidth="2.2" />
      <path d="M17 32h30" stroke="#15803d" strokeWidth="2.5" />
    </svg>
  );
}

function CooingArtwork(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...baseSvgProps} {...props}>
      <rect x="12" y="12" width="40" height="40" rx="12" fill="#dbeafe" />
      <circle cx="24" cy="31" r="10" fill="#93c5fd" />
      <path
        d="M16 23c2-5 8-7 12-4.5 2.5 1.4 3.8 4.1 3.8 6.8"
        stroke="#0f172a"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      />
      <path d="M27 24c.6.6 1.5 1.6 2.4 2.6.9 1 1.7 2 2.2 3" stroke="#1d4ed8" strokeWidth="1.8" fill="none" />
      <circle cx="30" cy="27" r="1.2" fill="#0f172a" />
      <path d="M30 35v4" stroke="#0f172a" strokeWidth="1.7" />
      <path d="M37 24c2.2 0 4 2 4 4 0 1.7-1.1 3.2-2.7 3.8" stroke="#0f172a" strokeWidth="1.5" />
      <path d="M31 23l.6 2.2m1.8-.2l-1.5 2" stroke="#f97316" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function BabblingArtwork(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...baseSvgProps} {...props}>
      <rect x="8" y="13" width="48" height="40" rx="11" fill="#ede9fe" />
      <path d="M14 30h18" stroke="#0f172a" strokeWidth="2.8" />
      <circle cx="22" cy="20" r="6" fill="#f9a8d4" />
      <circle cx="38" cy="22" r="5" fill="#fcd34d" />
      <rect x="17" y="40" width="8" height="6" rx="2" fill="#f8fafc" />
      <rect x="39" y="33" width="9" height="6" rx="2" fill="#e2e8f0" />
      <path
        d="M28 24c1.7.7 2.8 2.2 3.2 3.9-.6 1.9-2.4 3.6-4.6 3.7"
        fill="none"
        stroke="#0f172a"
        strokeWidth="2.1"
      />
      <path
        d="M30 42c.9-1 2-1.5 3.2-1.5M33 43.5c1.5-1.6 3.9-1.6 5.5 0"
        stroke="#7c3aed"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path d="M43 20.5c.3-1.8 1.8-3.2 3.7-3.2" stroke="#0f172a" strokeWidth="1.6" />
    </svg>
  );
}

function FirstWordArtwork(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...baseSvgProps} {...props}>
      <rect x="10" y="12" width="44" height="42" rx="10" fill="#dcfce7" />
      <path
        d="M18 24h28M18 29h22M18 34h19"
        stroke="#0f172a"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <rect x="21" y="17" width="12" height="8" rx="4" fill="#bbf7d0" />
      <path
        d="M35 17c3.5 0 6.5 2.6 6.5 6s-3 6-6.5 6c-1 0-2-.3-2.8-.8"
        fill="none"
        stroke="#16a34a"
        strokeWidth="2.3"
      />
      <path d="M31 22l6 2-6 2" stroke="#16a34a" strokeWidth="1.8" />
      <path d="M27.5 22l3 3m0 0-3 3" stroke="#0f172a" strokeWidth="1.5" />
      <circle cx="46" cy="30" r="3" fill="#15803d" />
      <path d="M44.5 30h3M45.9 28.6v2.8" stroke="white" strokeWidth="1.2" />
    </svg>
  );
}

function SocialSmileArtwork(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...baseSvgProps} {...props}>
      <rect x="12" y="12" width="40" height="40" rx="12" fill="#fef9c3" />
      <circle cx="32" cy="28" r="11" fill="#fcd34d" />
      <circle cx="28" cy="24" r="1.8" fill="#111827" />
      <circle cx="35" cy="24" r="1.8" fill="#111827" />
      <path
        d="M30.5 31.5c.9 1.3 2.5 2.1 4 2.1 1.5 0 2.9-.8 4-2.1"
        stroke="#111827"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path d="M24 18h4" stroke="#16a34a" strokeWidth="2" />
      <path d="M20 24l7 2-7 2" stroke="#16a34a" strokeWidth="2" />
      <path d="M39 18l7 2-7 2" stroke="#16a34a" strokeWidth="2" />
      <path d="M20 43h19" stroke="#166534" strokeWidth="2.5" />
      <path d="M27 43h2M30 43h6" stroke="#22c55e" strokeWidth="2.8" />
    </svg>
  );
}

function RespondsToNameArtwork(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...baseSvgProps} {...props}>
      <rect x="11" y="12" width="42" height="40" rx="9" fill="#e0e7ff" />
      <path d="M18 17c.8-2.5 3-4.2 5.7-4.2 1.4 0 2.7.5 3.7 1.4" stroke="#1d4ed8" strokeWidth="2" />
      <path d="M25 19l11 2" stroke="#0f172a" strokeWidth="2" />
      <circle cx="19" cy="29" r="7" fill="#bae6fd" />
      <path d="M19 29v1" stroke="#0f172a" strokeWidth="1.8" />
      <path d="M34 29c-1.4 0-3 1-3 2.7" fill="none" stroke="#0f172a" strokeWidth="2" />
      <path
        d="M40 14h-2.6v4.5h1v2h-3v2h3v2h-1v2h2.6M44 14h-2.6v4.5h1v2h-3v2h3v2h-1v2h2.6"
        fill="none"
        stroke="#7c3aed"
        strokeWidth="1.5"
      />
      <path d="M14 40h26" stroke="#4338ca" strokeWidth="2.5" />
      <path d="M14 42h34" stroke="#6366f1" strokeWidth="1.8" />
      <path d="M24 35.5l5 3.8 5-3.8" stroke="#4f46e5" strokeWidth="1.7" fill="none" />
      <circle cx="43" cy="28" r="3" fill="#ede9fe" />
      <path d="M42.2 27.5c.4 0 .8.1 1 .5.2.5 0 1-.4 1.1" stroke="#0f172a" strokeWidth="1" fill="none" />
    </svg>
  );
}

function ObjectPermanenceArtwork(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...baseSvgProps} {...props}>
      <rect x="10" y="12" width="44" height="40" rx="12" fill="#fef3c7" />
      <rect x="24" y="12" width="3.6" height="32" fill="#92400e" />
      <path
        d="M26 14h8l2 2v13h-4v-10h-2v10h-4z"
        fill="#fef08a"
        stroke="#a16207"
        strokeWidth="1.6"
      />
      <circle cx="33" cy="20" r="2" fill="#111827" />
      <circle cx="39" cy="20" r="2.5" fill="#22c55e" />
      <path d="M36 25l6 6h-6z" fill="#22c55e" />
      <path d="M42 29l7 6" stroke="#0f172a" strokeWidth="2.3" />
      <path
        d="M26.4 31c-3.8-1-8 1.2-8.9 4.9s1.7 7.4 5.3 8.3"
        stroke="#65a30d"
        strokeWidth="2.2"
        fill="none"
      />
      <path
        d="M16 34h6"
        stroke="#065f46"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <path d="M42 43v-9.2" stroke="#16a34a" strokeWidth="2" />
      <path d="M44 43v-8.3" stroke="#16a34a" strokeWidth="2" />
      <circle cx="42" cy="31.8" r="1.5" fill="#16a34a" />
    </svg>
  );
}

export function AppointmentArtwork(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...baseSvgProps} {...props}>
      <defs>
        <linearGradient
          id="appointmentBg"
          x1="8"
          y1="14"
          x2="56"
          y2="56"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="#dbeafe" />
          <stop offset="1" stopColor="#bfdbfe" />
        </linearGradient>
      </defs>
      <rect x="10" y="12" width="44" height="40" rx="9" fill="url(#appointmentBg)" />
      <rect x="18" y="15" width="28" height="10" rx="2.5" fill="#60a5fa" />
      <circle cx="20" cy="20" r="1.7" fill="#0b1220" />
      <circle cx="24" cy="20" r="1.7" fill="#0b1220" />
      <rect
        x="13"
        y="26"
        width="38"
        height="20"
        rx="2"
        fill="white"
        stroke="#93c5fd"
        strokeWidth="2"
      />
      <path d="M17 30h30" stroke="#e2e8f0" strokeWidth="1.5" />
      <path d="M17 33h30" stroke="#e2e8f0" strokeWidth="1.5" />
      <path d="M17 36h20" stroke="#e2e8f0" strokeWidth="1.5" />
      <path d="M31 40h15v2h-15z" fill="#93c5fd" opacity="0.8" />
      <circle cx="39.5" cy="35" r="4.5" fill="#f3f4f6" />
      <path
        d="M39.5 29.5v6a.6.6 0 0 1-.2.5l-3 3.4"
        stroke="#1d4ed8"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <path
        d="M33 24.5l6.1-3.4 6.4 3.3"
        stroke="#60a5fa"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <g fill="#1e3a8a">
        <circle cx="22.6" cy="20.8" r="2.3" />
        <rect x="34" y="18.6" width="8" height="4" rx="2" />
      </g>
    </svg>
  );
}

export type FeatureArtwork = typeof VaccinationArtwork;

export type HealthFeatureCardConfig = {
  href: string;
  labelKey: "vaccinations" | "growth" | "milestones" | "appointments";
  subtitleKey:
    | "vaccinationsSubtitle"
    | "growthSubtitle"
    | "milestonesSubtitle"
    | "appointmentsSubtitle";
  artwork: FeatureArtwork;
  gradient: string;
  iconColor: string;
};
