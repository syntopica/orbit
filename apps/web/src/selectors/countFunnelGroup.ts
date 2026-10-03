import type { ClipsView } from '@orbit/contract'

export const countFunnelGroup = (
  view: ClipsView,
  states: readonly string[],
): number =>
  view.states
    .filter((state) => states.includes(state.state))
    .reduce((total, state) => total + state.count, 0)
