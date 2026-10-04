import { COMPONENT_LABELS } from '../../labels/componentLabels'
import type { HistoryRange } from '../../types/HistoryRange'
import type { LaunchdRowGroup } from '../../types/LaunchdRowGroup'
import { LaunchdRowView } from './LaunchdRowView'

export const LaunchdGroup = ({
  group,
  range,
}: {
  group: LaunchdRowGroup
  range: HistoryRange
}) => (
  <section aria-label={COMPONENT_LABELS[group.component]} className="space-y-3">
    <h2 className="text-muted text-sm font-semibold uppercase">
      {COMPONENT_LABELS[group.component]}
    </h2>
    <ul className="space-y-3">
      {group.rows.map((row) => (
        <LaunchdRowView key={row.label} row={row} range={range} />
      ))}
    </ul>
  </section>
)
