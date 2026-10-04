import { CLIPS_LABELS } from '../../labels/clipsLabels'
import type { ClipsItemsSectionProps } from '../../types/ClipsItemsSectionProps'
import { ClipsItemRow } from './ClipsItemRow'

// Waiting clips first, oldest capture first, then the recently reconciled,
// in the engine's order. Null items: the engine was not asked to list them.
export const ClipsItemsSection = ({ items, now }: ClipsItemsSectionProps) => (
  <section
    aria-label={CLIPS_LABELS.items}
    className="border-line bg-panel space-y-3 rounded-xl border p-4"
  >
    <h2 className="text-lg font-semibold">{CLIPS_LABELS.items}</h2>
    {items === null ? (
      <p className="text-muted text-sm">{CLIPS_LABELS.itemsUnlisted}</p>
    ) : items.length === 0 ? (
      <p className="text-muted text-sm">{CLIPS_LABELS.nothingWaiting}</p>
    ) : (
      <ul
        aria-label={CLIPS_LABELS.itemList}
        className="divide-line divide-y text-sm"
      >
        {items.map((item) => (
          <ClipsItemRow key={item.id} item={item} now={now} />
        ))}
      </ul>
    )}
  </section>
)
