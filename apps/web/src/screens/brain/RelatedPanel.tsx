import { useRelatedPanel } from '../../hooks/useRelatedPanel'
import { RelatedList } from './RelatedList'

import { BRAIN_LABELS } from '../../labels/brainLabels'
import type { RelatedPanelProps } from '../../types/RelatedPanelProps'

// D5, D6: scored on request; the selected page's pairs first.
export const RelatedPanel = ({ selectedId, search }: RelatedPanelProps) => {
  const { asked, ask, related, loading, failed } = useRelatedPanel()
  return (
    <section
      aria-label={BRAIN_LABELS.related}
      className="border-line bg-panel space-y-3 rounded-xl border p-4 text-sm"
    >
      <h2 className="text-lg font-semibold">{BRAIN_LABELS.related}</h2>
      {asked ? null : (
        <button
          type="button"
          className="border-line rounded-lg border px-3 py-1.5"
          onClick={() => {
            ask()
          }}
        >
          {BRAIN_LABELS.showRelated}
        </button>
      )}
      {loading ? (
        <p className="text-muted">{BRAIN_LABELS.relatedLoading}</p>
      ) : null}
      {failed ? <p role="alert">{BRAIN_LABELS.relatedUnavailable}</p> : null}
      {related === null ? null : (
        <RelatedList
          related={related}
          selectedId={selectedId}
          search={search}
        />
      )}
    </section>
  )
}
