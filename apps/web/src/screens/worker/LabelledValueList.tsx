import type { LabelledValueListProps } from '../../types/LabelledValueListProps'

// Worker identifiers and numbers as a wrapping grid of terms.
export const LabelledValueList = ({ items }: LabelledValueListProps) => (
  <dl className="grid grid-cols-[repeat(auto-fill,minmax(10rem,1fr))] gap-x-4 gap-y-2 text-sm">
    {items.map((item) => (
      <div key={item.label} className="min-w-0">
        <dt className="text-muted text-xs">{item.label}</dt>
        <dd className="font-mono break-all">{item.value}</dd>
      </div>
    ))}
  </dl>
)
