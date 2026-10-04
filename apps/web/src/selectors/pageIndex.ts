import type { GraphModel } from '../types/GraphModel'

// The index of a page id in the model, or null when absent or unset.
export const pageIndex = (
  model: GraphModel | null,
  page: string | undefined,
): number | null =>
  model === null || page === undefined
    ? null
    : (model.indexOf.get(page) ?? null)
