import { createFileRoute } from "@tanstack/react-router";
import { Storefront } from "@/components/buzzko/Storefront";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "buzzko — keychains • phone charms • frames" },
      { name: "description", content: "Glossy, collectible keychains, phone charms and mini frames from buzzko." },
      { property: "og:title", content: "buzzko — keychains • phone charms • frames" },
      { property: "og:description", content: "Glossy, collectible keychains, phone charms and mini frames from buzzko." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Storefront,
});
