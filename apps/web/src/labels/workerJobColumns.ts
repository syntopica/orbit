// The job table's columns in order. Producer and privacy give way below the
// large breakpoint so the metrics keep their room.
export const WORKER_JOB_COLUMNS = [
  { label: 'Job', className: 'w-24' },
  { label: 'Queue', className: '' },
  { label: 'Producer', className: 'hidden lg:table-cell' },
  { label: 'State', className: 'w-24' },
  { label: 'Privacy', className: 'hidden w-20 lg:table-cell' },
  { label: 'Model', className: '' },
  { label: 'Tokens', className: 'w-28 text-right' },
  { label: 'Cost', className: 'w-20 text-right' },
  { label: 'Duration', className: 'w-20 text-right' },
  { label: 'Result', className: '' },
  { label: 'Created', className: 'w-28 text-right' },
] as const
