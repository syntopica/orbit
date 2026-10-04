export const ActionRunLink = ({
  id,
  state,
}: {
  id: string | null
  state: 'started' | 'succeeded' | 'failed' | undefined
}) => {
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
