// Weekday and clock in the viewer's zone: worker times span days.
export const formatLocalTime = (ms: number): string =>
  new Date(ms).toLocaleString('en-GB', {
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
