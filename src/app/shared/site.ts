export const SITE_NAME = "My Dev List";
export const SITE_DESCRIPTION =
  "A curated directory of developers and their portfolio sites.";
export const SITE_URL = "https://mydevlist.com";
export const SITE_OG_IMAGE = `${SITE_URL}/mydevlist.png`;

export function pageTitle(page?: string) {
  return page ? `${page} — ${SITE_NAME}` : SITE_NAME;
}

export function truncateDescription(text: string, maxLength = 160) {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 1).trimEnd()}…`;
}
