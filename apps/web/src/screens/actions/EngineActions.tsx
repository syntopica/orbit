import { useEngineActions } from '../../hooks/useEngineActions'
import { ActionButton } from './ActionButton'

export const EngineActions = ({ engine }: { engine: 'brain' | 'clips' }) => {
  const actions = useEngineActions(engine)
  if (actions.length === 0) return null
  return (
    <details className="border-line bg-panel rounded-xl border p-4">
      <summary className="cursor-pointer text-lg font-semibold">
        Actions
      </summary>
      <div className="mt-3 flex flex-wrap gap-2">
        {actions.map(([id, spec]) => (
          <ActionButton
            key={id}
            target={engine}
            action={id}
            label={spec.label}
            path={`/api/engines/${engine}/actions/${encodeURIComponent(id)}`}
          />
        ))}
      </div>
    </details>
  )
}
