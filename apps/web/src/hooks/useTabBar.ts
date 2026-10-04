import { useLocation } from '@tanstack/react-router'
import { useRef, useState } from 'react'

import { phoneSlotFor } from '../selectors/phoneSlotFor'

export const useTabBar = () => {
  const [open, setOpen] = useState(false)
  const trigger = useRef<HTMLButtonElement>(null)
  const slot = phoneSlotFor(useLocation().pathname)
  return { open, setOpen, trigger, slot }
}
