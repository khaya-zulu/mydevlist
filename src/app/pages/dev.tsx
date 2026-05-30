import { env } from "cloudflare:workers";
import type { RequestInfo } from "rwsdk/worker";
import Markdown from "react-markdown";

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
    <div>
      <div className="p-10 bg-neutral-50 border-b border-neutral-200 pb-40">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-2xl font-bold mb-2">
            Meet {developer.name ?? slug}
          </h1>
          {developer.role && (
            <div className="text-dot-gothic-16 mb-2">{developer.role}</div>
          )}
          {developer.summary && <p>{developer.summary}</p>}
        </div>
      </div>

      <div className="max-w-5xl mx-auto -translate-y-32">
        <img
          // src={`/screenshots/${slug}`}
          src="/example.png"
          alt={developer.name ?? slug}
          className="w-full h-auto"
        />

        <div className="py-4 border-b-2 border-purple-700 mb-8 mt-2">
          <div>{updatedAt}</div>
        </div>

        <div className="flex gap-4">
          <div className="flex-2 pr-10 flex flex-col gap-4">
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
