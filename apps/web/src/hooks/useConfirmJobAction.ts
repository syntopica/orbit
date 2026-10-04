import { useState, type KeyboardEvent } from 'react'

import { StepUpRequiredError } from '../api/StepUpRequiredError'
import { trapConfirmTab } from '../handlers/trapConfirmTab'
import { useStepUpPrompt } from './useStepUpPrompt'

export const useConfirmJobAction = (
  close: () => void,
  confirm: () => Promise<void>,
) => {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(false)
  const stepUp = useStepUpPrompt(() => undefined)
  const submit = () => {
    setBusy(true)
    void (async () => {
      try {
        await confirm()
        close()
      } catch (failure) {
        if (failure instanceof StepUpRequiredError) stepUp.openPrompt()
        else setError(true)
        setBusy(false)
      }
    })()
  }
  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'Escape') close()
    trapConfirmTab(event)
  }
  return { busy, error, submit, onKeyDown, stepUp }
}
