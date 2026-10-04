import type { PendingView } from '@orbit/contract'

import { formatStateCounts } from '../../formatters/formatStateCounts'
import { PendingSectionList } from './PendingSectionList'

export const PendingSourceSection = ({
  source,
  items,
  open,
  onOpenChange,
}: {
  source: PendingView['sources'][number]
  items: PendingView['items']
  open: boolean
  onOpenChange: (open: boolean) => void
}) => {
  if (items.length === 0) return null
  const sections = [...new Set(items.map((item) => item.section))]
  return (
    <section aria-label={source.name}>
      <details
        open={open}
        onToggle={(event) => {
          if (event.target === event.currentTarget)
            onOpenChange(event.currentTarget.open)
        }}
        className="group/source"
      >
        <summary className="flex cursor-pointer list-none flex-wrap items-baseline gap-x-3 gap-y-1 py-1 [&::-webkit-details-marker]:hidden">
          <span
            aria-hidden="true"
            className="text-muted inline-block text-xs transition-transform group-open/source:rotate-90"
          >
            ▶
          </span>
          <h2 className="text-lg font-semibold">{source.name}</h2>
          <span className="text-muted text-sm">
            {items.length} · {formatStateCounts(items)}
          </span>
        </summary>
        <div className="mt-2 space-y-4">
          {sections.map((section) => (
            <PendingSectionList
              key={section ?? ''}
              section={section}
              items={items.filter((item) => item.section === section)}
            />
          ))}
        </div>
      </details>
    </section>
  )
}
