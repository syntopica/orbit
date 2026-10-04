import type { PendingView } from '@orbit/contract'

export const PendingSourceIssues = ({
  sources,
}: {
  sources: PendingView['sources']
}) => {
  const failures = sources.filter((source) => source.status !== 'ok')
  if (failures.length === 0) return null
  return (
    <section
      aria-label="Source issues"
      className="border-warn rounded-xl border p-3"
    >
      <h2 className="font-semibold">Source issues</h2>
      <ul>
        {failures.map((source) => (
          <li key={source.id}>
            {source.name}: {source.status}
          </li>
        ))}
      </ul>
    </section>
  )
}
