import type { PendingSectionListProps } from '../../types/PendingSectionListProps'
import { PendingItemRow } from './PendingItemRow'

export const PendingSectionList = ({
  section,
  items,
}: PendingSectionListProps) => (
  <div className="space-y-1.5">
    {section !== null ? (
      <h3 className="text-muted text-sm font-medium">{section}</h3>
    ) : null}
    <ul className="divide-line border-line bg-panel divide-y rounded-xl border">
      {items.map((item) => (
        <li key={item.id}>
          <PendingItemRow item={item} />
        </li>
      ))}
    </ul>
  </div>
)
