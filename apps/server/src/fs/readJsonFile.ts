import { readFile } from 'node:fs/promises'

import { isNotFound } from './isNotFound'

export const readJsonFile = async (path: string): Promise<unknown> => {
  let text: string
  try {
    text = await readFile(path, 'utf8')
  } catch (error) {
    if (isNotFound(error)) return undefined
    throw error
  }
  try {
    return JSON.parse(text) as unknown
  } catch {
    // A parser message can quote the file's text, so it is not kept as a cause.
    throw new Error(`invalid JSON in ${path}`)
  }
}
