import { useMemo } from 'react'

import { selectCards } from '../selectors/selectCards'
import { selectPending } from '../selectors/selectPending'
import type { HomeModel } from '../types/HomeModel'
import { useMediaQuery } from './useMediaQuery'
import { useNow } from './useNow'
import { useStream } from './useStream'

export const useHomeModel = (): HomeModel => {
  const { snapshots, events, synced } = useStream()
  const isPhone = useMediaQuery('(max-width: 767px)')
  const reduced = useMediaQuery('(prefers-reduced-motion: reduce)')
  const now = useNow(1_000)
  const cards = useMemo(
    () => (synced ? selectCards(snapshots) : []),
    [snapshots, synced],
  )
  const pending = useMemo(
    () => (synced ? selectPending(snapshots) : []),
    [snapshots, synced],
  )
  return {
    cards,
    pending,
    events: synced ? events.slice(0, 20) : [],
    synced,
    isPhone,
    animate: !reduced,
    now,
  }
}
