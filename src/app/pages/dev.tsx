import { env } from "cloudflare:workers";
import type { RequestInfo } from "rwsdk/worker";
import { Markdown } from "@/app/components/markdown";
import { ArrowUpRightIcon } from "@/app/components/icons/arrow-up-right";
import { FeatherIcon } from "@/app/components/icons/feather";

export const Dev = async ({ params }: RequestInfo) => {
  const slug = params.devId;

  const stub = await env.DevAgent.getByName(slug);
  const { developer, socialLinks, crawledLinks } = await stub.getProfile();

  if (!developer) {
    return (
      <div className="max-w-5xl mx-auto p-10">
        <h1 className="text-2xl font-bold mb-2">Developer not found</h1>
        <p>We couldn't find a developer at "{slug}".</p>
      </div>
    );
  }

  const updatedAt = new Date(developer.updatedAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="bg-white">
      <div className="p-10 bg-neutral-50 border-b border-neutral-200 pb-40">
        <div className="max-w-5xl mx-auto">
          <a href="/" aria-label="Back home" className="inline-flex mb-8">
            <FeatherIcon className="text-cyan-600" />
          </a>
          <h1 className="text-3xl font-instrument mb-3">
            Meet {developer.name ?? slug}
          </h1>
          {developer.role && (
            <div className="text-dot-gothic-16 mb-4">{developer.role}</div>
          )}
          {developer.summary && (
            <p className="font-sans text-lg">{developer.summary}</p>
          )}
        </div>
      </div>

      <div className="max-w-5xl mx-auto -translate-y-32">
        {/* Digital version is the hero; the original floats as a small preview
            in the bottom-right corner, linking out to the developer's site. */}
        <a
          href={developer.website ?? `/${slug}`}
          target="_blank"
          rel="noreferrer"
          className="relative group"
        >
          <img
            src={`/screenshots/${slug}/digital`}
            alt={`${developer.name ?? slug} (digital)`}
            className="w-full aspect-video object-cover"
            style={{
              viewTransitionName: `vt-${slug.replace(/[^a-zA-Z0-9]+/g, "-")}`,
            }}
          />

          <div className="group absolute bottom-5 right-5 w-56 flex flex-col gap-2 bg-white p-2 rounded-md border-2 border-neutral-800 shadow-lg transition-transform duration-200 ease-out group-hover:-translate-y-1">
            <img
              src={`/screenshots/${slug}`}
              alt={developer.name ?? slug}
              className="w-full aspect-video object-cover rounded-sm bg-neutral-100"
            />
            <div className="flex items-center justify-between gap-2 px-1">
              <span className="text-xs truncate">
                {(developer.website ?? "")
                  .replace(/^https?:\/\//, "")
                  .replace(/\/$/, "")}
              </span>
              <ArrowUpRightIcon size={16} />
            </div>
          </div>
        </a>

        <div className="py-4 border-b-2 border-neutral-700 mb-8 mt-2">
          <div>{updatedAt}</div>
        </div>

        <div className="flex gap-4">
          <div className="flex-2 pr-10 flex flex-col gap-4 font-sans text-lg">
            <Markdown>{developer.bio}</Markdown>
          </div>
          <div className="flex-1 flex flex-col gap-4">
            <div>
              <div>Social Media</div>
              <hr className="mt-4 border-neutral-200 border" />
              <ul className="mt-4 flex flex-col gap-2">
                {socialLinks.length === 0 && (
                  <li className="text-neutral-400">None found</li>
                )}
                {socialLinks.map((link) => (
                  <li key={link.id}>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noreferrer"
                      className="underline"
                    >
                      {link.platform}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <div>Links Crawled</div>
              <hr className="mt-4 border-neutral-200 border" />
              <ul className="mt-4 flex flex-col gap-2">
                {crawledLinks.length === 0 && (
                  <li className="text-neutral-400">None yet</li>
                )}
                {crawledLinks.map((link) => (
                  <li key={link.id}>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noreferrer"
                      className="underline"
                    >
                      {link.title ?? link.url}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
