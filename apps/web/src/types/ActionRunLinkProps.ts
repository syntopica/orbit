export type ActionRunLinkProps = {
  readonly id: string | null
  readonly state: 'started' | 'succeeded' | 'failed' | 'interrupted' | undefined
}
