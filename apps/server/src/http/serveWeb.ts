import type { Hono } from 'hono'
import { getMimeType } from 'hono/utils/mime'
import { readFile } from 'node:fs/promises'

import type { OrbitEnv } from '../types/OrbitEnv'
import { acceptsHtml } from './acceptsHtml'
import { isUnsafeWebPath } from './isUnsafeWebPath'
import { resolveWebFile } from './resolveWebFile'

// Registered after the /api sub-app, whose catch-all answers every /api path.
export const serveWeb = (app: Hono<OrbitEnv>, webRoot: string): void => {
  app.get('*', async (c) => {
    const path = c.req.path.endsWith('/')
      ? `${c.req.path}index.html`
      : c.req.path
    if (isUnsafeWebPath(path)) return c.json({ error: 'not_found' }, 404)
    const file =
      (await resolveWebFile(webRoot, path)) ??
      (acceptsHtml(c) ? await resolveWebFile(webRoot, '/index.html') : null)
    if (file === null) return c.json({ error: 'not_found' }, 404)
    const type = getMimeType(file) ?? 'application/octet-stream'
    return c.body(await readFile(file), 200, { 'Content-Type': type })
  })
}
