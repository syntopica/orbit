export type ShrinkTarget = {
  readonly table: 'metric_samples' | 'launchd_observations' | 'metric_rollups'
  readonly column: 'at' | 'hour'
  // A closed, constant SQL predicate selecting the rows that may be deleted.
  readonly candidates: string
}
