import { LAST_PAGE_KEY } from './lastPageKey'

// Best effort: a refused write only loses the convenience.
export const writeLastPage = (id: string): void => {
  try {
    localStorage.setItem(LAST_PAGE_KEY, id)
  } catch {
    // Storage unavailable; the next visit opens on the most linked page.
  }
}
