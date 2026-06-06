import type { Developer } from "@/db/data";
import {
  SITE_NAME,
  SITE_URL,
  pageTitle,
  truncateDescription,
} from "@/app/shared/site";

type SeoProps = {
  title: string;
  description: string;
  url?: string;
  image?: string;
  type?: "website" | "profile" | "article";
};

export const Seo = ({
  title,
  description,
  url = SITE_URL,
  image,
  type = "website",
}: SeoProps) => (
  <>
    <title>{title}</title>
    <meta name="description" content={description} />
    <meta property="og:type" content={type} />
    <meta property="og:site_name" content={SITE_NAME} />
    <meta property="og:title" content={title} />
    <meta property="og:description" content={description} />
    <meta property="og:url" content={url} />
    {image && <meta property="og:image" content={image} />}
    <meta
      name="twitter:card"
      content={image ? "summary_large_image" : "summary"}
    />
    <meta name="twitter:title" content={title} />
    <meta name="twitter:description" content={description} />
    {image && <meta name="twitter:image" content={image} />}
  </>
);

export const DevSeo = ({
  developer,
  slug,
}: {
  developer: Developer;
  slug: string;
}) => {
  const name = developer.name ?? slug;

  return (
    <Seo
      title={pageTitle(`Meet ${name}`)}
      description={truncateDescription(
        developer.summary ?? developer.role ?? `${name} on ${SITE_NAME}.`,
      )}
      url={`${SITE_URL}/${slug}`}
      image={`${SITE_URL}/screenshots/${slug}/digital`}
      type="profile"
    />
  );
};
