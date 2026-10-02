// Ages and durations only: a negative one is clock skew, shown as zero.
export const secondsToMs = (seconds: number): number =>
  Math.max(0, Math.round(seconds * 1000))
