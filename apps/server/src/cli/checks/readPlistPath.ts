import { parseJsonOrNull } from './parseJsonOrNull'

// The PATH under EnvironmentVariables, or null when absent or unparseable.
export const readPlistPath = (json: string): string | null => {
  const parsed = parseJsonOrNull(json)
  const env =
    typeof parsed === 'object' && parsed !== null
      ? (parsed as Record<string, unknown>)['EnvironmentVariables']
      : null
  const path =
    typeof env === 'object' && env !== null
      ? (env as Record<string, unknown>)['PATH']
      : null
  return typeof path === 'string' && path !== '' ? path : null
}
