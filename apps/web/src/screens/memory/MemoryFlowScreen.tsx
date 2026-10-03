import { ConnectionIndicator } from '../../components/shell/ConnectionIndicator'
import { formatDuration } from '../../formatters/formatDuration'
import { useMemoryFlow } from '../../hooks/useMemoryFlow'
import { FLOW_LABELS } from '../../labels/flowLabels'
import { MemoryFlowBody } from './MemoryFlowBody'

export const MemoryFlowScreen = () => {
  const model = useMemoryFlow()
  return (
    <main className="mx-auto max-w-6xl space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">
          {FLOW_LABELS.title}
        </h1>
        {model.isPhone ? <ConnectionIndicator /> : null}
      </header>
      {model.failed ? (
        <p role="alert">
          {FLOW_LABELS.unavailable}{' '}
          {model.staleAgeMs !== null &&
            `${FLOW_LABELS.lastGood} ${formatDuration(model.staleAgeMs)} ${FLOW_LABELS.old}`}
        </p>
      ) : null}
      {model.flow === null && !model.failed && (
        <p className="text-muted">{FLOW_LABELS.loading}</p>
      )}
      {model.flow !== null && (
        <div
          role="region"
          aria-label={FLOW_LABELS.data}
          className={
            model.staleAgeMs === null
              ? 'space-y-6'
              : 'text-muted space-y-6 grayscale'
          }
        >
          <MemoryFlowBody flow={model.flow} model={model} />
        </div>
      )}
    </main>
  )
}
