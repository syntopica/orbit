export type WatchDeps = {
  readonly probe: () => Promise<boolean>
  readonly restart: () => Promise<boolean>
  readonly readCount: () => Promise<number>
  readonly writeCount: (count: number) => Promise<void>
  readonly log: (line: string) => void
}
