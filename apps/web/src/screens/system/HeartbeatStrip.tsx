import { formatClock } from '../../formatters/formatClock'
import { BUCKET_LABELS } from '../../labels/bucketLabels'
import type { HeartbeatStripProps } from '../../types/HeartbeatStripProps'

export const HeartbeatStrip = ({ buckets, summary }: HeartbeatStripProps) => (
  <svg
    role="img"
    aria-label={summary}
    viewBox={`0 0 ${String(buckets.length * 6)} 24`}
    preserveAspectRatio="none"
    className="h-6 w-full"
  >
    {buckets.map((bucket, index) => (
      <rect
        key={bucket.start}
        x={index * 6}
        width={4}
        height={24}
        rx={1}
        data-state={bucket.state}
        className="fill-unknown/40 data-[state=failed]:fill-down data-[state=idle]:fill-line data-[state=missed]:fill-warn data-[state=ok]:fill-ok"
      >
        <title>{`${formatClock(new Date(bucket.start).toISOString())}: ${BUCKET_LABELS[bucket.state]}`}</title>
      </rect>
    ))}
  </svg>
)
