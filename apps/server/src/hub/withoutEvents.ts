import type { Snapshot } from '@orbit/contract'

// Events travel as their own messages, so a stored snapshot keeps none.
export const withoutEvents = (snapshot: Snapshot): Snapshot => ({
  ...snapshot,
  events: [],
  lastGood:
    snapshot.lastGood === null ? null : { ...snapshot.lastGood, events: [] },
})
