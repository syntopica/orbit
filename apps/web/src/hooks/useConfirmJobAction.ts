import { useState, type KeyboardEvent } from 'react'

import { trapConfirmTab } from '../handlers/trapConfirmTab'

export const useConfirmJobAction = (
  close: () => void,
  confirm: () => Promise<void>,
) => {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(false)
  const submit = () => {
    setBusy(true)
    void (async () => {
      try {
        await confirm()
        close()
      } catch {
        setError(true)
        setBusy(false)
      }
    })()
  }
  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'Escape') close()
    trapConfirmTab(event)
  }
  return { busy, error, submit, onKeyDown }
}
