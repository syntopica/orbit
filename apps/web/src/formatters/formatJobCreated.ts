// Day, month and clock in the viewer's zone: a job list spans weeks.
export const formatJobCreated = (ms: number): string =>
  new Date(ms).toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
