import type { PollTracker } from '../types/PollTracker'

export const noopTracker: PollTracker = {
  attempt: () => undefined,
  settle: () => undefined,
  scheduled: () => undefined,
}
