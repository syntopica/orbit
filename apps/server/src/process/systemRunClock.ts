import { loadavg } from 'node:os'

import type { RunClock } from '../types/RunClock'

export const systemRunClock: RunClock = {
  now: () => performance.now(),
  load: () => loadavg()[0] ?? 0,
  wall: () => new Date(),
}
