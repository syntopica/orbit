import { isIdentifier } from './isIdentifier'

// A secondary field that fails the identifier check is blanked, not the row.
export const identifierOrNull = (
  value: string | null | undefined,
): string | null => (isIdentifier(value) ? value : null)
