export const formatRef = (
  key: string,
  value: string | number,
  reasons: Readonly<Record<string, string>>,
): string => {
  const text = String(value)
  if (key === 'job') return `job ${text.slice(0, 8)}`
  if (key === 'exit') return `exit ${text}`
  if (key === 'reason') return reasons[text] ?? text
  return text
}
