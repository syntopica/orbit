import { useRef } from 'react'

import type { StageListItemProps } from '../types/StageListItemProps'

export const useStageListItem = (onSelect: StageListItemProps['onSelect']) => {
  const buttonRef = useRef<HTMLButtonElement>(null)
  return {
    buttonRef,
    close: () => {
      onSelect(null)
      buttonRef.current?.focus()
    },
  }
}
