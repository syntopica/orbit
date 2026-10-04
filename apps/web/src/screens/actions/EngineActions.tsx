import { useEngineActions } from '../../hooks/useEngineActions'
import { ActionButton } from './ActionButton'

// Inline in the screen header: a run is one click and a confirmation away,
// and an engine has a handful of actions at most.
export const EngineActions = ({ engine }: { engine: 'brain' | 'clips' }) => {
  const actions = useEngineActions(engine)
  if (actions.length === 0) return null
  return (
    <div
      role="group"
      aria-label="Actions"
      className="flex flex-wrap items-center gap-2"
    >
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
  )
}
