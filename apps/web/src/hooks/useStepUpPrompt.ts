import { useState, type SubmitEvent } from 'react'

import { apiFetch } from '../api/apiFetch'

export const useStepUpPrompt = (onSuccess: () => void) => {
  const [token, setToken] = useState('')
  const [stepError, setStepError] = useState(false)
  const [prompt, setPrompt] = useState(false)
  const submit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault()
    const body = JSON.stringify({ token })
    setToken('')
    void (async () => {
      try {
        const response = await apiFetch('/api/session/step-up', {
          method: 'POST',
          body,
        })
        setStepError(!response.ok)
        if (response.ok) {
          setPrompt(false)
          onSuccess()
        }
      } catch {
        setStepError(true)
      }
    })()
  }
  return {
    token,
    setToken,
    stepError,
    prompt,
    submit,
    openPrompt: () => {
      setPrompt(true)
    },
    cancelPrompt: () => {
      setPrompt(false)
      setToken('')
    },
  }
}
