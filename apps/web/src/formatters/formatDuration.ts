export const formatDuration = (ms: number): string => {
  const seconds = Math.max(0, Math.floor(ms / 1000))
  if (seconds < 60) return `${String(seconds)}s`
  if (seconds < 3_600) return `${String(Math.floor(seconds / 60))}m`
  if (seconds < 172_800) return `${String(Math.floor(seconds / 3_600))}h`
  return `${String(Math.floor(seconds / 86_400))}d`
}
