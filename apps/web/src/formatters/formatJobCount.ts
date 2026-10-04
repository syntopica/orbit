// The result line under the job filters.
export const formatJobCount = (count: number, hasOlder: boolean): string =>
  `${String(count)} ${count === 1 ? 'job' : 'jobs'}, newest first${hasOlder ? '; older jobs on the next page' : ''}`
