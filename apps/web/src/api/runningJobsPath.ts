// The worker's live states, one page: what is being processed right now.
export const RUNNING_JOBS_PATH =
  '/api/worker/jobs?state=leased%2Crunning%2Cdraining&limit=100'
