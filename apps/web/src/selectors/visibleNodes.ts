import type { GraphModel } from '../types/GraphModel'
import { neighbourhood } from './neighbourhood'

// D10: type filters apply in both views; a local view needs a focus; the
// focus itself is always visible.
export const visibleNodes = (
  model: GraphModel,
  hidden: readonly string[],
  focus: number | null,
  depth: number,
): readonly boolean[] => {
  const hiddenTypes = new Set(hidden)
  const local =
    focus === null || depth === 0
      ? null
      : neighbourhood(model.neighbours, focus, depth)
  return model.types.map(
    (type, index) =>
      index === focus ||
      ((local === null || local.has(index)) && !hiddenTypes.has(type)),
  )
}
