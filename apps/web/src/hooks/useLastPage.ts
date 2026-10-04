import { useEffect, useState } from 'react'

import { readLastPage } from '../graph/readLastPage'
import { writeLastPage } from '../graph/writeLastPage'

// The last page selected, kept across visits, so the local view stays on it
// after the selection is cleared and opens on it next time.
export const useLastPage = (page: string | undefined): string | null => {
  const [last, setLast] = useState(readLastPage)
  if (page !== undefined && page !== last) setLast(page)
  useEffect(() => {
    if (page !== undefined) writeLastPage(page)
  }, [page])
  return last
}
