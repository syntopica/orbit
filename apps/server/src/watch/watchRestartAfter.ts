// Consecutive failed probes before the watcher restarts orbit: one miss can be
// a slow moment, two at a five-minute interval is a hung server.
export const WATCH_RESTART_AFTER = 2
