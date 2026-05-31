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
