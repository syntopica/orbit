import type { AtriumContext } from '@orbit/contract'
import { type SubmitEvent, useId, useState } from 'react'

import { postAtriumContext } from '../api/postAtriumContext'
import { toContextErrorCode } from '../selectors/toContextErrorCode'
import type { ContextErrorCode } from '../types/ContextErrorCode'
import type { ContextInspectorModel } from '../types/ContextInspectorModel'

// The result is content: component state only, gone when the screen unmounts
// (spec 6.6); it is never cached or persisted.
export const useContextInspector = (): ContextInspectorModel => {
  const countId = useId()
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<ContextInspectorModel['status']>('idle')
  const [error, setError] = useState<ContextErrorCode | null>(null)
  const [result, setResult] = useState<AtriumContext | null>(null)
  const submit = (event: SubmitEvent<HTMLFormElement>): void => {
    event.preventDefault()
    setStatus('loading')
    setResult(null)
    setError(null)
    void (async () => {
      try {
        setResult(await postAtriumContext(query.trim()))
        setStatus('done')
      } catch (caught) {
        setError(toContextErrorCode(caught))
        setStatus('error')
      }
    })()
  }
  return { query, max: 500, countId, setQuery, submit, status, error, result }
}
