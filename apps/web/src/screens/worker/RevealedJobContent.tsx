import type { useJobContentPanel } from '../../hooks/useJobContentPanel'
import { JobContentPane } from './JobContentPane'

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
      <div className="grid gap-4 lg:grid-cols-2">
        <JobContentPane
          title="Input"
          text={model.inputText}
          onCopy={model.copy}
        />
        <JobContentPane
          title="Output"
          text={model.outputText}
          onCopy={model.copy}
        />
      </div>
    ) : null}
  </>
)
