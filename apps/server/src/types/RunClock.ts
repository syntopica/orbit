// What timedRunner reads around a command: a monotonic millisecond clock, the
// host's one-minute load average and the wall time.
export type RunClock = {
  readonly now: () => number
  readonly load: () => number
  readonly wall: () => Date
}
