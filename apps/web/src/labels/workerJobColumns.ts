// The job table's columns in order. Producer and privacy give way below the
// extra-large breakpoint, so names and metrics keep their room; `numeric`
// ones align right. Names keep their full width and numbers never wrap.
export const WORKER_JOB_COLUMNS = [
  { label: 'Job', hideBelow: null, numeric: false },
  { label: 'Queue', hideBelow: null, numeric: false },
  { label: 'Producer', hideBelow: 'xl', numeric: false },
  { label: 'State', hideBelow: null, numeric: false },
  { label: 'Privacy', hideBelow: 'xl', numeric: false },
  { label: 'Model', hideBelow: null, numeric: false },
  { label: 'Tokens in → out', hideBelow: null, numeric: true },
  { label: 'Cost', hideBelow: null, numeric: true },
  { label: 'Duration', hideBelow: null, numeric: true },
  { label: 'Result', hideBelow: null, numeric: false },
  { label: 'Created', hideBelow: null, numeric: true },
] as const
