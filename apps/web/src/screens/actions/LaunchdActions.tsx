import type { LaunchdRow } from '../../types/LaunchdRow'
import { ActionButton } from './ActionButton'

export const LaunchdActions = ({ row }: { row: LaunchdRow }) => (
  <div className="flex flex-wrap gap-2">
    {row.actions.map((action) => (
      <ActionButton
        key={action}
        target={row.label}
        action={action}
        label={action === 'run' ? 'Run now' : 'Restart'}
        path={`/api/launchd/${encodeURIComponent(row.label)}/${action}`}
      />
    ))}
  </div>
)
