import { Link } from '@tanstack/react-router'

import { formatClipsRun } from '../../formatters/formatClipsRun'
import { formatDuration } from '../../formatters/formatDuration'
import { shortenId } from '../../formatters/shortenId'
import { CLIPS_LABELS } from '../../labels/clipsLabels'
import type { ClipsItemRowProps } from '../../types/ClipsItemRowProps'
import { validateBrainSearch } from '../../validators/validateBrainSearch'

// One clip as a wrapping row of codes and counts: what holds it, where it is,
// how often it was tried, what its last run did and cost, and where it ran
// and landed (worker jobs, brain pages).
export const ClipsItemRow = ({ item, now }: ClipsItemRowProps) => (
  <li className="flex flex-wrap items-baseline gap-x-3 gap-y-1 py-2">
    <span className="font-mono" title={item.id}>
      {shortenId(item.id)}
    </span>
    <span className="font-mono">{item.state}</span>
    <span className="text-muted font-mono wrap-anywhere">
      {item.failure === null
        ? item.reason
        : `${item.failure.code} @ ${item.failure.stage}`}
    </span>
    <span>
      {CLIPS_LABELS.stage} {item.stage}
    </span>
    <span className="tabular-nums">
      {item.capturedAt === null
        ? CLIPS_LABELS.unknownAge
        : formatDuration(now - item.capturedAt)}
    </span>
    <span className="tabular-nums">
      {item.attempts} {CLIPS_LABELS.attempts}
    </span>
    {item.lastRun === null ? null : (
      <span className="tabular-nums">
        {CLIPS_LABELS.lastRun} {formatClipsRun(item.lastRun)}
      </span>
    )}
    {item.lastRun?.workerJobIds.map((id) => (
      <Link
        key={id}
        to="/worker/jobs/$id"
        params={{ id }}
        aria-label={`${CLIPS_LABELS.workerJob} ${id}`}
        className="text-accent font-mono underline"
      >
        {shortenId(id)}
      </Link>
    ))}
    {item.pages.map((page) => (
      <Link
        key={page}
        to="/brain"
        search={validateBrainSearch({ page })}
        className="text-accent font-mono break-all underline"
      >
        {page}
      </Link>
    ))}
  </li>
)
