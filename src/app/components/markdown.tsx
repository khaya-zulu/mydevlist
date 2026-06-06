import ReactMarkdown, { type Options } from "react-markdown";

// Wraps react-markdown with our element styling (links, etc.). Extra props and
// component overrides passed in are merged on top of the defaults.
export const Markdown = ({ components, ...props }: Options) => {
  return (
    <ReactMarkdown
      {...props}
      components={{
        a: ({ children, ...rest }) => (
          <a
            {...rest}
            target="_blank"
            rel="noreferrer"
            className="text-cyan-600 underline underline-offset-2 decoration-cyan-600/40 hover:decoration-cyan-600 transition-colors"
          >
            {children}
          </a>
        ),
        h1: ({ children, ...rest }) => (
          <h1
            {...rest}
            className="font-instrument text-3xl mt-6 first:mt-0 mb-1"
          >
            {children}
          </h1>
        ),
        h2: ({ children, ...rest }) => (
          <h2
            {...rest}
            className="font-instrument text-2xl mt-6 first:mt-0 mb-1"
          >
            {children}
          </h2>
        ),
        h3: ({ children, ...rest }) => (
          <h3
            {...rest}
            className="font-instrument text-xl mt-4 first:mt-0 mb-1"
          >
            {children}
          </h3>
        ),
        h4: ({ children, ...rest }) => (
          <h4
            {...rest}
            className="font-sans font-semibold text-lg mt-4 first:mt-0 mb-1"
          >
            {children}
          </h4>
        ),
        h5: ({ children, ...rest }) => (
          <h5
            {...rest}
            className="font-sans font-semibold text-base mt-4 first:mt-0 mb-1"
          >
            {children}
          </h5>
        ),
        h6: ({ children, ...rest }) => (
          <h6
            {...rest}
            className="font-sans font-semibold text-sm uppercase tracking-wide mt-4 first:mt-0 mb-1"
          >
            {children}
          </h6>
        ),
        blockquote: ({ children, ...rest }) => (
          <blockquote
            {...rest}
            className="border-l-2 border-neutral-300 pl-4 italic"
          >
            {children}
          </blockquote>
        ),
        code: ({ children, className, ...rest }) => {
          const isBlock = (className ?? "").includes("language-");
          return (
            <code
              {...rest}
              className={
                isBlock
                  ? className
                  : "font-mono text-[0.9em] bg-neutral-100 rounded px-1.5 py-0.5"
              }
            >
              {children}
            </code>
          );
        },
        pre: ({ children, ...rest }) => (
          <pre
            {...rest}
            className="font-mono text-sm bg-neutral-100 rounded-md p-4 overflow-x-auto"
          >
            {children}
          </pre>
        ),
        ul: ({ children, ...rest }) => (
          <ul {...rest} className="list-disc pl-6 flex flex-col gap-1">
            {children}
          </ul>
        ),
        ol: ({ children, ...rest }) => (
          <ol {...rest} className="list-decimal pl-6 flex flex-col gap-1">
            {children}
          </ol>
        ),
        li: ({ children, ...rest }) => (
          <li {...rest} className="pl-1">
            {children}
          </li>
        ),
        ...components,
      }}
    />
  );
};
