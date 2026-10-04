import { formatCount } from '../../formatters/formatCount'
import { useAtriumSyntheses } from '../../hooks/useAtriumSyntheses'
import { ATRIUM_LABELS } from '../../labels/atriumLabels'
import { RecentSynthesesTable } from './RecentSynthesesTable'
import { TokensPerDayChart } from './TokensPerDayChart'

// What synthesis processed: the newest records with model, tokens and
// duration, and tokens per day. Text is behind each row's reveal.
export const RecentSynthesesSection = () => {
  const query = useAtriumSyntheses()
  return (
    <section
      aria-label={ATRIUM_LABELS.recent}
      className="border-line bg-panel space-y-4 rounded-xl border p-4"
    >
      <h2 className="text-lg font-semibold">{ATRIUM_LABELS.recent}</h2>
      {query.isPending ? (
        <p className="text-muted text-sm">{ATRIUM_LABELS.recentLoading}</p>
      ) : null}
      {query.isError ? (
        <p className="text-muted text-sm">{ATRIUM_LABELS.recentUnavailable}</p>
      ) : null}
      {query.data === undefined ? null : (
        <>
          <p className="text-muted text-xs">
            {formatCount(query.data.records)} {ATRIUM_LABELS.registry}
          </p>
          <TokensPerDayChart daily={query.data.daily} />
          <RecentSynthesesTable view={query.data} />
        </>
      )}
    </section>
  )
}
