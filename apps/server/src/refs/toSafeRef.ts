export const toSafeRef = (value: string | null): string | undefined =>
  value !== null && value.length <= 64 && /^[\w.:-]+$/.test(value)
    ? value
    : undefined
