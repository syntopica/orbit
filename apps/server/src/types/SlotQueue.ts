export type SlotQueue = {
  acquire(signal: AbortSignal): Promise<void>
  release(): void
}
