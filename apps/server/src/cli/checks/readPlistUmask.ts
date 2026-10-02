import { parseJsonOrNull } from './parseJsonOrNull'

// The plist's Umask as a number, or null when absent or unparseable.
export const readPlistUmask = (json: string): number | null => {
  const parsed = parseJsonOrNull(json)
  const umask =
    typeof parsed === 'object' && parsed !== null
      ? (parsed as Record<string, unknown>)['Umask']
      : null
  return typeof umask === 'number' ? umask : null
}
