import type { SVGProps } from "react";

const baseSvgProps: SVGProps<SVGSVGElement> = {
  viewBox: "0 0 64 64",
  fill: "none",
  xmlns: "http://www.w3.org/2000/svg",
};

export function VaccinationArtwork(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...baseSvgProps} {...props}>
      <rect
        x="18"
        y="10"
        width="28"
        height="44"
        rx="14"
        className="stroke-current/90"
        strokeWidth="4"
        strokeLinejoin="round"
      />
      <path
        d="M31 4v10M33 4v10"
        className="stroke-current/80"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path
        d="M25 20c1.2 3.8 2.5 8 8 8s6.8-4.2 8-8"
        className="stroke-current/75"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <circle cx="32" cy="35" r="8" className="fill-current/12" />
      <path
        d="M28 35l3 3 7-7"
        className="stroke-current/95"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function GrowthArtwork(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...baseSvgProps} {...props}>
      <path
        d="M10 46h44"
        className="stroke-current/40"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path
        d="M14 44c3-12 9-20 18-22 9-2 16 4 22 16"
        className="stroke-current/80"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <circle cx="18" cy="40" r="4" className="fill-current/85" />
      <circle cx="28" cy="34" r="4" className="fill-current/75" />
      <circle cx="36" cy="25" r="4" className="fill-current/65" />
      <circle cx="46" cy="20" r="4" className="fill-current/55" />
      <path
        d="M16 22h16v14h16"
        className="stroke-current/50"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M18 18h14v9"
        className="stroke-current/70"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function MilestoneArtwork(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...baseSvgProps} {...props}>
      <rect
        x="12"
        y="12"
        width="40"
        height="40"
        rx="8"
        className="stroke-current/70"
        strokeWidth="4"
      />
      <path
        d="M18 16h28v30H18z"
        className="stroke-current/40"
        strokeWidth="2"
      />
      <path
        d="M20 46l6-8 8 5 10-12 10 7"
        className="stroke-current/90"
        strokeWidth="4"
        strokeLinejoin="round"
      />
      <circle cx="24" cy="24" r="3" className="fill-current/90" />
      <circle cx="34" cy="24" r="3" className="fill-current/80" />
      <circle cx="44" cy="24" r="3" className="fill-current/70" />
      <path
        d="M18 39c2 0 4-1 6-1 4 0 5 5 10 5 4 0 6-4 8-4 3 0 5 2 6 2"
        className="stroke-current/55"
        strokeWidth="2.5"
      />
    </svg>
  );
}

export function AppointmentArtwork(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...baseSvgProps} {...props}>
      <rect
        x="12"
        y="18"
        width="34"
        height="34"
        rx="8"
        className="stroke-current/80"
        strokeWidth="4"
      />
      <path
        d="M18 18V12c0-3 2-4 4-4h6c2 0 4 1 4 4v6"
        className="stroke-current/80"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path
        d="M20 30h16"
        className="stroke-current/60"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M24 36h8"
        className="stroke-current/60"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <circle cx="26" cy="40" r="1.8" className="fill-current/95" />
      <path
        d="M30 40a2 2 0 1 1 0-4 2 2 0 0 1 0 4z"
        className="fill-current/95"
      />
      <path
        d="M34 40a2 2 0 1 1 0-4 2 2 0 0 1 0 4z"
        className="fill-current/95"
      />
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

