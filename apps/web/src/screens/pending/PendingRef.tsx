import { Link } from '@tanstack/react-router'

import { pendingItemReference } from '../../selectors/pendingItemReference'
import type { PendingRefProps } from '../../types/PendingRefProps'
import { validateBrainSearch } from '../../validators/validateBrainSearch'
import { PendingFileRef } from './PendingFileRef'

export const PendingRef = ({ item }: PendingRefProps) => {
  const reference = pendingItemReference(item)
  if (typeof reference !== 'string')
    return <PendingFileRef reference={reference} />
  if (item.kind === 'brain')
    return (
      <Link
        to="/brain"
        search={validateBrainSearch({ page: reference })}
        className="text-accent text-sm underline"
      >
        Open page
      </Link>
    )
  if (item.kind === 'worker')
    return (
      <Link
        to="/worker/jobs/$id"
        params={{ id: reference }}
        className="text-accent text-sm underline"
      >
        Open job
      </Link>
    )
  return (
    <Link
      to="/clips"
      search={{ range: '24h' }}
      className="text-accent text-sm underline"
    >
      Open Clips
    </Link>
  )
}
