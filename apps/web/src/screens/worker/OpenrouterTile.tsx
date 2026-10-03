import { formatCount } from '../../formatters/formatCount'
import { ACTIVITY_LABELS } from '../../labels/activityLabels'
import type { OpenrouterTileProps } from '../../types/OpenrouterTileProps'
import { Sparkline } from './Sparkline'

// Attempts, never "requests of a limit": the provider quota is unknown here.
export const OpenrouterTile = ({ today, bucketMs }: OpenrouterTileProps) => (
  <div
    role="group"
    aria-labelledby="openrouter-today"
    className="border-line bg-panel space-y-1 rounded-xl border p-4 md:w-56"
  >
    <p id="openrouter-today" className="text-muted text-xs">
      {ACTIVITY_LABELS.openrouter}
    </p>
    <p className="text-2xl font-semibold">{formatCount(today.count)}</p>
    {today.values.length > 1 && (
      <Sparkline
        starts={today.starts}
        values={today.values}
        bucketMs={bucketMs}
        label={ACTIVITY_LABELS.openrouterTrend}
        unit="attempts"
        stroke="stroke-series-2"
        dot="fill-series-2"
      />
    )}
  </div>
)
