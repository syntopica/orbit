import { formatSchedule } from '../../formatters/formatSchedule'
import { useLaunchdRowModel } from '../../hooks/useLaunchdRowModel'
import type { LaunchdRowViewProps } from '../../types/LaunchdRowViewProps'
import { LaunchdActions } from '../actions/LaunchdActions'
import { HeartbeatStrip } from './HeartbeatStrip'

export const LaunchdRowView = ({ row, range }: LaunchdRowViewProps) => {
  const model = useLaunchdRowModel(row, range)
  return (
    <li className="border-line bg-panel space-y-2 rounded-xl border p-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="font-mono text-sm">{row.label}</h3>
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-muted text-xs">
            <span>{formatSchedule(row)}</span> · <span>{model.state}</span>
          </span>
          <LaunchdActions row={row} />
        </div>
      </div>
      {model.buckets !== null && (
        <HeartbeatStrip buckets={model.buckets} summary={model.summary} />
      )}
    </li>
  )
}
