import type { BrainSearch } from '../types/BrainSearch'

export const withPage = (
  search: BrainSearch,
  id: string | null,
): BrainSearch => {
  const { depth, color, orphans, hide, range } = search
  return {
    depth,
    color,
    orphans,
    hide,
    range,
    ...(id === null ? {} : { page: id }),
  }
}
