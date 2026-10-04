import type { BrainSearch } from '../types/BrainSearch'

export const withPage = (
  search: BrainSearch,
  id: string | null,
): BrainSearch => {
  const {
    depth,
    color,
    orphans,
    hide,
    hideOrphans,
    maxLinks,
    cluster,
    scene,
    range,
  } = search
  return {
    depth,
    color,
    orphans,
    hide,
    hideOrphans,
    maxLinks,
    cluster,
    scene,
    range,
    ...(id === null ? {} : { page: id }),
  }
}
