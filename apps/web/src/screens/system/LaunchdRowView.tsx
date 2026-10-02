import { formatSchedule } from '../../formatters/formatSchedule'
import { useLaunchdRowModel } from '../../hooks/useLaunchdRowModel'
import { COMPONENT_LABELS } from '../../labels/componentLabels'
import type { LaunchdRowViewProps } from '../../types/LaunchdRowViewProps'
import { HeartbeatStrip } from './HeartbeatStrip'

export const LaunchdRowView = ({ row, range }: LaunchdRowViewProps) => {
  const model = useLaunchdRowModel(row, range)
  return (
    <li className="border-line bg-panel space-y-2 rounded-xl border p-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="font-mono text-sm">{row.label}</h2>
        <span className="text-muted text-xs">
          {COMPONENT_LABELS[row.component]} · {row.role} ·{' '}
          <span>{formatSchedule(row)}</span> · <span>{model.state}</span>
        </span>
      </div>
      {model.buckets !== null && (
        <HeartbeatStrip buckets={model.buckets} summary={model.summary} />
      )}
    </li>
  )
}
