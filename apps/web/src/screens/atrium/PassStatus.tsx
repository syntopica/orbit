import { PASS_DOTS } from '../../charts/passDots'
import { formatCount } from '../../formatters/formatCount'
import { formatPassProgress } from '../../formatters/formatPassProgress'
import { formatPassSummary } from '../../formatters/formatPassSummary'
import { useAtriumPasses } from '../../hooks/useAtriumPasses'
import { ATRIUM_LABELS } from '../../labels/atriumLabels'
import { selectEndedPass } from '../../selectors/selectEndedPass'

// Every pass end from atrium's tick log, including one the time box killed,
// which synthesis.json never records (spec 7.4).
export const PassStatus = () => {
  const query = useAtriumPasses()
  if (query.data === undefined)
    return query.isError ? (
      <p className="text-muted text-sm">{ATRIUM_LABELS.passesUnavailable}</p>
    ) : null
  const ended = selectEndedPass(query.data)
  const progress = formatPassProgress(query.data)
  const streak = query.data.unsuccessfulStreak
  return (
    <div className="space-y-1 text-sm">
      {ended === null ? (
        <p className="text-muted">{ATRIUM_LABELS.noPassLog}</p>
      ) : (
        <p className="flex items-center gap-1.5">
          <span
            aria-hidden="true"
            className={`size-2 shrink-0 rounded-full ${PASS_DOTS[ended.state]}`}
          />
          {ATRIUM_LABELS.lastPass}: {formatPassSummary(ended, query.data.now)}
        </p>
      )}
      {streak > 1 ? (
        <p>
          {formatCount(streak)} {ATRIUM_LABELS.streak}
        </p>
      ) : null}
      {progress === null ? null : <p className="text-muted">{progress}</p>}
    </div>
  )
}
