import type { JobContentPaneProps } from '../../types/JobContentPaneProps'

// Plain text in a monospace block, never rendered as Markdown or HTML.
export const JobContentPane = ({
  title,
  text,
  onCopy,
}: JobContentPaneProps) => (
  <section aria-label={title} className="min-w-0 space-y-2">
    <div className="flex items-center justify-between gap-3">
      <h3 className="font-semibold">{title}</h3>
      {text === null ? null : (
        <button
          type="button"
          onClick={() => {
            onCopy(text)
          }}
          className="cursor-pointer underline"
        >
          Copy {title.toLowerCase()}
        </button>
      )}
    </div>
    {text === null ? (
      <p className="text-muted text-sm">Not stored.</p>
    ) : (
      <pre className="bg-space overflow-x-auto rounded p-3 text-xs whitespace-pre-wrap">
        {text}
      </pre>
    )}
  </section>
)
