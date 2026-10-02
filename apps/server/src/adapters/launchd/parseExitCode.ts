export const parseExitCode = (value: string): number | null => {
  const match = /^(-?\d+)/.exec(value.trim())
  return match?.[1] === undefined ? null : Number(match[1])
}
