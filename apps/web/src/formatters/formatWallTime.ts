// A run's length with the precision a job needs: tenths of a second under a
// minute, then minutes and seconds, then hours and minutes. Unknown is a dash.
export const formatWallTime = (ms: number | null): string => {
  if (ms === null) return '—'
  const tenths = Math.max(0, Math.round(ms / 100))
  if (tenths < 600) return `${(tenths / 10).toFixed(1)}s`
  const seconds = Math.floor(tenths / 10)
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60)
    return `${String(minutes)}m ${String(seconds % 60).padStart(2, '0')}s`
  return `${String(Math.floor(minutes / 60))}h ${String(minutes % 60).padStart(2, '0')}m`
}
