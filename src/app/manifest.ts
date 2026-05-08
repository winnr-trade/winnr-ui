import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Winnr",
    short_name: "Winnr",
    description: "Predict the future. Trade with conviction.",
    start_url: "/",
    display: "standalone",
    background_color: "#000000",
    theme_color: "#00BB7E",
    icons: [
      {
        src: "/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
    screenshots: [
      {
        src: "/ss-desktop.png",
        sizes: "3400x1912",
        type: "image/png",
        form_factor: "wide",
        label: "Winnr Desktop",
      },
      {
        src: "/ss-mobile.png",
        sizes: "768x1600",
        type: "image/png",
        label: "Winnr Mobile",
      },
    ],
  };
}
