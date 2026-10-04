import type { useJobContentPanel } from '../../hooks/useJobContentPanel'

export const RevealedJobContent = ({
  model,
}: {
  model: ReturnType<typeof useJobContentPanel>
}) => (
  <>
    <button
      type="button"
      onClick={model.content.hide}
      className="text-accent underline"
    >
      Hide content
    </button>
    {model.content.query.isPending ? <p>Loading content…</p> : null}
    {model.content.query.isError ? (
      <p role="alert">Could not reveal content.</p>
    ) : null}
    {model.content.query.data ? (
      <>
        <button type="button" onClick={model.copy} className="ml-3 underline">
          Copy
        </button>
        <pre className="bg-space overflow-x-auto rounded p-3 text-xs whitespace-pre-wrap">
          {model.text}
        </pre>
      </>
    ) : null}
  </>
)
