export type WorkerBlocker = {
  readonly kind:
    | 'cooldown'
    | 'stale'
    | 'in_use'
    | 'battery'
    | 'pressure'
    | 'blocked'
    | 'no_nodes'
  // The worker name the cause is about: a runner or a node.
  readonly subject: string | null
  readonly ms: number | null
  // A worker code shown verbatim, for causes orbit has no words for.
  readonly code: string | null
}
