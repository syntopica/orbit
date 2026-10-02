import type { Hub } from '../types/Hub'
import { createHub } from './createHub'

// The hub as the server runs it. Ids start at the start-up time in ms (13
// digits, within what Last-Event-ID parsing accepts) so a restarted server
// always numbers above the ids a browser saw before the restart, and that
// browser gets a resync instead of a replay of unrelated ids.
export const createServerHub = (now: () => number = Date.now): Hub =>
  createHub({ ringSize: 1000, recentEvents: 50, firstId: now() })
