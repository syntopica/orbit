import type { PendingView } from '@orbit/contract'

import { PendingItemRow } from './PendingItemRow'

export const PendingSourceSection = ({
  source,
  items,
}: {
  source: PendingView['sources'][number]
  items: PendingView['items']
}) => {
  if (items.length === 0) return null
  const sections = [...new Set(items.map((item) => item.section))]
  return (
    <section aria-label={source.name} className="space-y-3">
      <h2 className="text-xl font-semibold">{source.name}</h2>
      {sections.map((section) => (
        <div key={section ?? ''} className="space-y-2">
          {section !== null ? (
            <h3 className="text-muted text-sm font-medium">{section}</h3>
          ) : null}
          <ul className="space-y-2">
            {items
              .filter((item) => item.section === section)
              .map((item) => (
                <li key={item.id}>
                  <PendingItemRow item={item} />
                </li>
              ))}
          </ul>
        </div>
      ))}
    </section>
  )
}
