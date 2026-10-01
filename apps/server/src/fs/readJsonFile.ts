import { readFile } from 'node:fs/promises'

import { isNotFound } from './isNotFound'

export const readJsonFile = async (path: string): Promise<unknown> => {
  try {
    return JSON.parse(await readFile(path, 'utf8')) as unknown
  } catch (error) {
    if (isNotFound(error)) return undefined
    throw error
  }
}
