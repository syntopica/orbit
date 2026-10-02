export type ShrinkTarget =
  | { readonly table: 'metric_samples'; readonly column: 'at' }
  | { readonly table: 'launchd_observations'; readonly column: 'at' }
  | { readonly table: 'metric_rollups'; readonly column: 'hour' }
