import { ConnectionIndicator } from '../../components/shell/ConnectionIndicator'
import { formatDuration } from '../../formatters/formatDuration'
import { useClipsModel } from '../../hooks/useClipsModel'
import { CLIPS_LABELS } from '../../labels/clipsLabels'
import { EngineActions } from '../actions/EngineActions'
import { ClipsBody } from './ClipsBody'

export const ClipsScreen = () => {
  const model = useClipsModel()
  return (
    <main className="mx-auto max-w-7xl space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">
          {CLIPS_LABELS.title}
        </h1>
        {model.isPhone ? <ConnectionIndicator /> : null}
      </header>
      <EngineActions engine="clips" />
      {model.failed ? (
        <p role="alert">
          {CLIPS_LABELS.unavailable}{' '}
          {model.staleAgeMs !== null &&
            `${CLIPS_LABELS.lastGood} ${formatDuration(model.staleAgeMs)} ${CLIPS_LABELS.old}`}
        </p>
      ) : null}
      {model.view === null && !model.failed && (
        <p className="text-muted">{CLIPS_LABELS.loading}</p>
      )}
      {model.view !== null && (
        <div
          role="region"
          aria-label={CLIPS_LABELS.data}
          className={
            model.staleAgeMs === null
              ? 'space-y-6'
              : 'text-muted space-y-6 grayscale'
          }
        >
          <ClipsBody view={model.view} model={model} />
        </div>
      )}
    </main>
  )
}
