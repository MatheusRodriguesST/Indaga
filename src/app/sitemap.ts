import type { MetadataRoute } from "next";
import { appUrl } from "@/lib/app-url";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = appUrl();
  return [
    { url: base, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/desafio`, changeFrequency: "weekly", priority: 0.8 },
  ];
}
