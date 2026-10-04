export type PollTracker = {
  attempt(): void
  settle(ok: boolean): void
  scheduled(delayMs: number): void
}
