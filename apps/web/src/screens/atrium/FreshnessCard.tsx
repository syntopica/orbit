import { formatDuration } from '../../formatters/formatDuration'
import { ATRIUM_LABELS } from '../../labels/atriumLabels'
import { selectFreshnessRows } from '../../selectors/selectFreshnessRows'
import type { FreshnessCardProps } from '../../types/FreshnessCardProps'
import { StateBadge } from '../memory/StateBadge'

export const FreshnessCard = ({ view }: FreshnessCardProps) => (
  <section
    aria-label={ATRIUM_LABELS.freshness}
    className="border-line bg-panel space-y-3 rounded-xl border p-4"
  >
    <h2 className="text-lg font-semibold">{ATRIUM_LABELS.freshness}</h2>
    <dl className="divide-line divide-y text-sm">
      {selectFreshnessRows(view).map((row) => (
        <div
          key={row.name}
          className="flex flex-wrap items-center gap-x-3 py-2"
        >
          <dt className="min-w-32">{row.name}</dt>
          <dd className="tabular-nums">
            {row.at === null
              ? ATRIUM_LABELS.never
              : `${formatDuration(view.now - row.at)} ${ATRIUM_LABELS.ago}`}
          </dd>
          <dd className="text-muted text-xs">
            {ATRIUM_LABELS.within} {formatDuration(row.policyMs)}
          </dd>
          <dd className="ml-auto">
            <StateBadge state={row.state} />
          </dd>
        </div>
      ))}
    </dl>
    <p className="text-muted text-xs">
      {ATRIUM_LABELS.written} {formatDuration(view.now - view.writtenAt)}{' '}
      {ATRIUM_LABELS.ago}
    </p>
  </section>
)
