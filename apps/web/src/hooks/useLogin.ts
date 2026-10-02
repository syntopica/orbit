import { useNavigate } from '@tanstack/react-router'
import { type SubmitEvent, useState } from 'react'

import { apiFetch } from '../api/apiFetch'
import type { LoginModel } from '../types/LoginModel'
import type { LoginStatus } from '../types/LoginStatus'

export const useLogin = (): LoginModel => {
  const navigate = useNavigate()
  const [token, setToken] = useState('')
  const [status, setStatus] = useState<LoginStatus>('idle')
  const submit = (event: SubmitEvent<HTMLFormElement>): void => {
    event.preventDefault()
    const body = JSON.stringify({ token })
    setStatus('busy')
    setToken('')
    void (async () => {
      try {
        const response = await apiFetch('/api/session', {
          method: 'POST',
          body,
        })
        if (response.ok) await navigate({ to: '/' })
        else setStatus('rejected')
      } catch {
        setStatus('error')
      }
    })()
  }
  return { token, status, setToken, submit }
}
