import type { GraphModel } from '../types/GraphModel'
import type { PageFilter } from '../types/PageFilter'

// Type filters, hidden orphans and the hub cap remove pages before a view is
// built; the focus page always stays.
export const filterPages = (
  model: GraphModel,
  filter: PageFilter,
  focus: number | null,
): readonly boolean[] => {
  const hidden = new Set(filter.hide)
  const cap = filter.maxLinks ?? Infinity
  return model.types.map(
    (type, index) =>
      index === focus ||
      (!hidden.has(type) &&
        !(filter.hideOrphans && model.orphan[index] === true) &&
        (model.degree[index] ?? 0) <= cap),
  )
}
