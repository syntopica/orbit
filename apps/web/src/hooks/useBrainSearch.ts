import { useNavigate, useSearch } from '@tanstack/react-router'
import { useCallback, useMemo } from 'react'

import { searchForNode } from '../selectors/searchForNode'
import type { BrainSearch } from '../types/BrainSearch'
import type { BrainSearchModel } from '../types/BrainSearchModel'
import type { BrainSearchPatch } from '../types/BrainSearchPatch'
import { validateBrainSearch } from '../validators/validateBrainSearch'

// The router shares unchanged search objects structurally, so `search` keeps
// its identity until the URL changes and the graph is not rebuilt per render.
export const useBrainSearch = (): BrainSearchModel => {
  const raw = useSearch({ strict: false })
  const search = useMemo(() => validateBrainSearch(raw), [raw])
  const navigate = useNavigate()
  const go = useCallback(
    (next: BrainSearch) => {
      void navigate({ to: '/brain', search: next })
    },
    [navigate],
  )
  const select = useCallback(
    (id: string | null) => {
      go(searchForNode(search, id))
    },
    [go, search],
  )
  const update = useCallback(
    (patch: BrainSearchPatch) => {
      go({ ...search, ...patch })
    },
    [go, search],
  )
  return { search, select, update }
}
