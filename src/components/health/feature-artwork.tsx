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
