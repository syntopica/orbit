// What a live stream needs from outside: the injected clock and whether the
// session that opened it is still valid.
export type StreamClock = {
  now: () => number
  isLive: () => boolean
}
