import { CLIPS_STATE_ORDER } from './clipsStateOrder'

export const clipsStateRank = (state: string): number => {
  const at = CLIPS_STATE_ORDER.indexOf(state)
  return at === -1 ? CLIPS_STATE_ORDER.length : at
}
