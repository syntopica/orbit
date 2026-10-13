export type SlotWaiter = {
  readonly signal: AbortSignal
  readonly start: () => void
}
