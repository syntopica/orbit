import { LAST_PAGE_KEY } from './lastPageKey'

// Storage can be missing or refuse access (private windows); then there is
// no remembered page.
export const readLastPage = (): string | null => {
  try {
    return localStorage.getItem(LAST_PAGE_KEY)
  } catch {
    return null
  }
}
