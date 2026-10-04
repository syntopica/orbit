// Succeeded attempts as a whole percentage; no attempts reads as a dash.
export const formatSuccessRate = (succeeded: number, attempts: number) =>
  attempts === 0 ? '—' : `${String(Math.round((succeeded / attempts) * 100))}%`
