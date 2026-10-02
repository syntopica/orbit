export const parseInteger = (value: string | undefined): number | null =>
  value !== undefined && /^-?\d+$/.test(value) ? Number(value) : null
