import { useState } from 'react'
import { useBrainRelated } from './useBrainRelated'

export const useRelatedPanel = () => {
  const [asked, setAsked] = useState(false)
  return {
    ...useBrainRelated(asked),
    asked,
    ask: () => {
      setAsked(true)
    },
  }
}
