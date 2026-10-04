import type { WorkerJobDetail } from '@orbit/contract'

import { useJobContentPanel } from '../../hooks/useJobContentPanel'
import { RevealedJobContent } from './RevealedJobContent'
import { SecretTokenForm } from './SecretTokenForm'

export const JobContentPanel = ({ job }: { job: WorkerJobDetail }) => {
  const model = useJobContentPanel(job)
  const stored = job.hasInput || job.hasOutput
  return (
    <section
      aria-label="Content"
      className="border-line bg-panel space-y-3 rounded-xl border p-4"
    >
      <h2 className="text-lg font-semibold">Content</h2>
      {stored ? null : <p>Content is no longer stored.</p>}
      {!model.content.open && !model.prompt && stored ? (
        <button
          type="button"
          className="text-accent underline"
          onClick={model.show}
        >
          {job.privacy === 'public' || job.privacy === 'internal'
            ? 'Open content'
            : 'Reveal'}
        </button>
      ) : null}
      {model.prompt ? <SecretTokenForm model={model} /> : null}
      {model.content.open ? <RevealedJobContent model={model} /> : null}
    </section>
  )
}
