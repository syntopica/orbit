import { useBrainPage } from '../../hooks/useBrainPage'
import { BRAIN_LABELS } from '../../labels/brainLabels'
import type { PagePanelProps } from '../../types/PagePanelProps'
import { PageDetails } from './PageDetails'

// D1: the fixed frontmatter fields, the rendered body and the links.
export const PagePanel = ({ id, search, select }: PagePanelProps) => {
  const { page, loading, missing, failed } = useBrainPage(id)
  return (
    <section
      aria-label={BRAIN_LABELS.pageRegion}
      className="border-line bg-panel min-w-0 space-y-4 rounded-xl border p-4 lg:shadow-xl"
    >
      <div className="flex items-start justify-between gap-2">
        <h2 className="text-lg font-semibold wrap-break-word">
          {page?.title ?? id}
        </h2>
        <button
          type="button"
          className="text-muted text-sm underline"
          onClick={() => {
            select(null)
          }}
        >
          {BRAIN_LABELS.clearSelection}
        </button>
      </div>
      {loading ? (
        <p className="text-muted text-sm">{BRAIN_LABELS.pageLoading}</p>
      ) : null}
      {missing ? (
        <p role="alert" className="text-sm">
          {BRAIN_LABELS.pageMissing}
        </p>
      ) : null}
      {failed ? (
        <p role="alert" className="text-sm">
          {BRAIN_LABELS.pageUnavailable}
        </p>
      ) : null}
      {page === null ? null : <PageDetails page={page} search={search} />}
    </section>
  )
}
