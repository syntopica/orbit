import { ConnectionIndicator } from '../../components/shell/ConnectionIndicator'
import { formatDuration } from '../../formatters/formatDuration'
import { useAtriumModel } from '../../hooks/useAtriumModel'
import { ATRIUM_LABELS } from '../../labels/atriumLabels'
import { AtriumBody } from './AtriumBody'
import { ContextInspector } from './ContextInspector'
import { RecentSynthesesSection } from './RecentSynthesesSection'

export const AtriumScreen = () => {
  const model = useAtriumModel()
  return (
    <main className="mx-auto max-w-7xl space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">
          {ATRIUM_LABELS.title}
        </h1>
        {model.isPhone ? <ConnectionIndicator /> : null}
      </header>
      {model.failed ? (
        <p role="alert">
          {ATRIUM_LABELS.unavailable}{' '}
          {model.staleAgeMs !== null &&
            `${ATRIUM_LABELS.lastGood} ${formatDuration(model.staleAgeMs)} ${ATRIUM_LABELS.old}`}
        </p>
      ) : null}
      {model.view === null && !model.failed && (
        <p className="text-muted">{ATRIUM_LABELS.loading}</p>
      )}
      {model.view !== null && (
        <div
          role="region"
          aria-label={ATRIUM_LABELS.data}
          className={
            model.staleAgeMs === null
              ? 'space-y-6'
              : 'text-muted space-y-6 grayscale'
          }
        >
          <AtriumBody view={model.view} model={model} />
        </div>
      )}
      <RecentSynthesesSection />
      <ContextInspector />
    </main>
  )
}
