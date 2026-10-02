import { useLocation, useNavigate } from '@tanstack/react-router'
import { useEffect, useRef, useState } from 'react'

import { apiFetch } from '../api/apiFetch'
import type { PairStatus } from '../types/PairStatus'
import { validatePairFragment } from '../validators/validatePairFragment'

export const usePair = (): PairStatus => {
  const hash = useLocation({ select: (location) => location.hash })
  const navigate = useNavigate()
  const [fragment] = useState(() => validatePairFragment(hash))
  const [status, setStatus] = useState<PairStatus>(
    fragment === null ? 'invalid' : 'busy',
  )
  const started = useRef(false)
  useEffect(() => {
    if (started.current) return
    started.current = true
    // Drop the secret from the address bar and history before posting it.
    void navigate({ to: '/pair', hash: '', replace: true })
    if (fragment === null) return
    void (async () => {
      try {
        const response = await apiFetch('/api/pair', {
          method: 'POST',
          body: JSON.stringify(fragment),
        })
        if (response.ok) await navigate({ to: '/' })
        else setStatus('rejected')
      } catch {
        setStatus('error')
      }
    })()
  }, [fragment, navigate])
  return status
}
