import type { AtriumContext } from '@orbit/contract'
import type { SubmitEvent } from 'react'

import type { ContextErrorCode } from './ContextErrorCode'

export type ContextInspectorModel = {
  readonly query: string
  readonly max: number
  readonly countId: string
  readonly setQuery: (query: string) => void
  readonly submit: (event: SubmitEvent<HTMLFormElement>) => void
  readonly status: 'idle' | 'loading' | 'error' | 'done'
  readonly error: ContextErrorCode | null
  readonly result: AtriumContext | null
}
