import type { Context } from 'hono'
import type { OrbitEnv } from '../../types/OrbitEnv'

// A malformed body is just an invalid credential; the parse error is dropped.
export const readJsonBody = async (
  c: Context<OrbitEnv, string>,
): Promise<unknown> => {
  try {
    return await c.req.json<unknown>()
  } catch {
    return null
  }
}
