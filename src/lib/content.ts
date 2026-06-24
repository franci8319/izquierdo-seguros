import siteContent from "../../content/site.json";
import type { SiteContent } from "@/types/content";

export function getSiteContent(): SiteContent {
  return siteContent as SiteContent;
}
