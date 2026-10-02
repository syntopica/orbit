import { useEffect } from 'react'

export const useHotkey = (key: string, onPress: () => void): void => {
  useEffect(() => {
    const listener = (event: KeyboardEvent): void => {
      if (event.key.toLowerCase() !== key || !(event.metaKey || event.ctrlKey))
        return
      event.preventDefault()
      onPress()
    }
    document.addEventListener('keydown', listener)
    return () => {
      document.removeEventListener('keydown', listener)
    }
  }, [key, onPress])
}
