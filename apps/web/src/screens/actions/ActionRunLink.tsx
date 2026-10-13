import type { ActionRunLinkProps } from '../../types/ActionRunLinkProps'

export const ActionRunLink = ({ id, state }: ActionRunLinkProps) => {
  if (id === null) return null
  const suffix = state === 'succeeded' || state === 'failed' ? '-complete' : ''
  return (
    <a
      href={`/#action-${id}${suffix}`}
      className="text-muted text-xs underline"
    >
      View run
    </a>
  )
}
