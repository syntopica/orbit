import { use } from 'react'

import { StreamContext } from '../contexts/StreamContext'
import type { StreamValue } from '../types/StreamValue'

export const useStream = (): StreamValue => {
  const value = use(StreamContext)
  if (value === null) throw new Error('useStream needs <StreamProvider>')
  return value
}
