// Where a stage's freshness instant comes from (spec 7.4).
export type FreshSource =
  | 'atrium.archive'
  | 'atrium.refresh'
  | 'atrium.content'
  | 'atrium.synthesis'
  | 'oldest_pending'
  | 'label'
