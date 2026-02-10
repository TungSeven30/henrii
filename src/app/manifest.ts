import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "henrii",
    short_name: "henrii",
    description:
      "Baby tracking PWA for feedings, sleep, diapers, milestones, and appointments.",
    start_url: "/en",
    display: "standalone",
    background_color: "#FFF8F5",
    theme_color: "#F8B4C8",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
