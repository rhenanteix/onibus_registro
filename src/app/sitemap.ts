import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    "",
    "/como-usar",
    "/projeto",
    "/roadmap",
    "/docs",
    "/docs/api",
    "/licenca",
  ].map((path) => ({ url: `${siteUrl}${path}`, priority: path ? 0.5 : 1 }));
}
