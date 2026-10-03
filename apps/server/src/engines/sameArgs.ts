export const sameArgs = (a: readonly string[], b: readonly string[]): boolean =>
  a.length === b.length && a.every((arg, i) => arg === b[i])
