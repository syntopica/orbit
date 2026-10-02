export type WorkerAdapterDeps = {
  readonly url: string
  readonly tokenFile: string
  readonly cadenceMs: number
  readonly fetch: typeof fetch
}
