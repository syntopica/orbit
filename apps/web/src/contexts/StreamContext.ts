import { createContext } from 'react'

import type { StreamValue } from '../types/StreamValue'

export const StreamContext = createContext<StreamValue | null>(null)
