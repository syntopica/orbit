import { realpath } from 'node:fs/promises'

// The web root's real path, or null when it does not exist.
export const resolveWebRoot = async (
  webRoot: string,
): Promise<string | null> => {
  try {
    return await realpath(webRoot)
  } catch {
    return null
  }
}
