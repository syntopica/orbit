import { useState } from 'react'

import { hasWebGl } from '../graph/hasWebGl'

// Probe once per mount instead of allocating a context on every selection.
export const useWebGl = (): boolean => {
  const [available] = useState(hasWebGl)
  return available
}
