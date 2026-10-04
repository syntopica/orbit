import { useEffect, useRef } from 'react'

import { trapMoreSheetTab } from '../handlers/trapMoreSheetTab'

export const useMoreSheetKeyboard = (onClose: () => void) => {
  const dialog = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
        return
      }
      if (event.key === 'Tab') trapMoreSheetTab(event, dialog.current)
    }
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [onClose])
  return dialog
}
