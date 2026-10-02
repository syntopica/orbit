import { useNavigate } from '@tanstack/react-router'
import { useEffect, useMemo, useReducer, useState } from 'react'

import { applyStreamMessage } from '../stream/applyStreamMessage'
import { connectStream } from '../stream/connectStream'
import { INITIAL_STREAM_STATE } from '../stream/initialStreamState'
import type { StreamStatus } from '../types/StreamStatus'
import type { StreamValue } from '../types/StreamValue'

export const useStreamConnection = (): StreamValue => {
  const [state, dispatch] = useReducer(applyStreamMessage, INITIAL_STREAM_STATE)
  const [status, setStatus] = useState<StreamStatus>('connecting')
  const navigate = useNavigate()
  useEffect(
    () => connectStream({ onMessage: dispatch, onStatus: setStatus }),
    [],
  )
  useEffect(() => {
    if (status === 'unauthorized') void navigate({ to: '/login' })
  }, [status, navigate])
  return useMemo(() => ({ ...state, status }), [state, status])
}
