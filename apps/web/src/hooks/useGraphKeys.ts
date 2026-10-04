import { useEffect } from 'react'

import { graphKeyPatch } from '../selectors/graphKeyPatch'
import type { BrainSearchModel } from '../types/BrainSearchModel'
import { isEditableTarget } from '../validators/isEditableTarget'

// Kumu-style view keys anywhere on the Brain screen except in fields.
export const useGraphKeys = ({ search, update }: BrainSearchModel): void => {
  useEffect(() => {
    const listener = (event: KeyboardEvent): void => {
      if (event.defaultPrevented || event.metaKey || event.ctrlKey) return
      if (event.altKey || isEditableTarget(event.target)) return
      const patch = graphKeyPatch(event.key, search)
      if (patch === null) return
      event.preventDefault()
      update(patch)
    }
    document.addEventListener('keydown', listener)
    return () => {
      document.removeEventListener('keydown', listener)
    }
  }, [search, update])
}
