import { COMPONENT_LABELS } from '../../labels/componentLabels'
import type { LaunchdGroupProps } from '../../types/LaunchdGroupProps'
import { LaunchdRowView } from './LaunchdRowView'

export const LaunchdGroup = ({ group, range }: LaunchdGroupProps) => (
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
