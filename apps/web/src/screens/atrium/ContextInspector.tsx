import { useContextInspector } from '../../hooks/useContextInspector'
import { CONTEXT_LABELS } from '../../labels/contextLabels'
import { ContextForm } from './ContextForm'
import { ContextResult } from './ContextResult'

// Spec 7.4: what `atrium context --json` would hand a session, on demand.
export const ContextInspector = () => {
  const model = useContextInspector()
  return (
    <section
      aria-label={CONTEXT_LABELS.title}
      className="border-line bg-panel space-y-3 rounded-xl border p-4"
    >
      <h2 className="text-lg font-semibold">{CONTEXT_LABELS.title}</h2>
      <p className="text-muted text-sm">{CONTEXT_LABELS.intro}</p>
      <ContextForm model={model} />
      {model.status === 'loading' ? (
        <p role="status" className="text-muted text-sm">
          {CONTEXT_LABELS.loading}
        </p>
      ) : null}
      {model.error === null ? null : (
        <p role="alert" className="text-down text-sm">
          {CONTEXT_LABELS.errors[model.error]}
        </p>
      )}
      {model.result === null ? null : <ContextResult result={model.result} />}
    </section>
  )
}
