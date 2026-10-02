// The plist's Umask as a number, or null when absent or unparseable.
export const readPlistUmask = (json: string): number | null => {
  try {
    const parsed: unknown = JSON.parse(json)
    const umask =
      typeof parsed === 'object' && parsed !== null
        ? (parsed as Record<string, unknown>)['Umask']
        : null
    return typeof umask === 'number' ? umask : null
  } catch {
    return null
  }
}
