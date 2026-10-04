import { chmod, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { orbitConfigSchema } from '../../config/orbitConfigSchema'
import { createEngineRunner } from '../../engines/createEngineRunner'
import { runProcess } from '../../process/runProcess'
import { buildSteppedApp } from '../../test/buildSteppedApp'

describe('engine action timeout', () => {
  // A 3 s action budget: at host load ~50 the spawned node child needed more
  // than 1 s to install its SIGTERM handler, so the marker never appeared.
  it('kills the action process group and reports no output', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'orbit-action-'))
    try {
      const marker = join(dir, 'child-stopped')
      const command = join(dir, 'action.cjs')
      const script = `#!/usr/bin/env node
const { spawn } = require('node:child_process')
spawn(process.execPath, ['-e', 'process.on("SIGTERM", () => { require("node:fs").writeFileSync(process.env.MARKER, "stopped"); process.exit(0) }); setInterval(() => {}, 1000)'], { env: process.env, stdio: 'ignore' })
process.stdout.write('PRIVATE OUTPUT')
setInterval(() => {}, 1000)
`
      await writeFile(command, script)
      await chmod(command, 0o755)
      const config = orbitConfigSchema.parse({
        engines: {
          brain: {
            command,
            subcommands: [['status']],
            actions: {
              rebuild: { args: ['action'], label: 'Rebuild', timeoutS: 3 },
            },
          },
        },
      })
      const runner = createEngineRunner(
        { file: command, subcommands: [['action']], env: { MARKER: marker } },
        runProcess,
      )
      const app = buildSteppedApp({
        actions: {
          launchd: undefined,
          engines: config.engines,
          runners: { brain: runner },
          run: runProcess,
          uid: 501,
          env: {},
        },
      })
      const response = await app.post(
        '/api/engines/brain/actions/rebuild',
        '',
        { Cookie: app.cookie },
      )
      expect(response.status).toBe(202)
      await vi.waitFor(
        async () => {
          expect(
            (
              (await (await app.get('/api/actions')).json()) as {
                runs: { state: string }[]
              }
            ).runs[0]?.state,
          ).toBe('failed')
        },
        { timeout: 10_000 },
      )
      await vi.waitFor(
        async () => {
          expect(await readFile(marker, 'utf8')).toBe('stopped')
        },
        { timeout: 10_000 },
      )
      expect(JSON.stringify(app.deps.hub.recentEvents())).not.toContain(
        'PRIVATE',
      )
    } finally {
      await rm(dir, { recursive: true, force: true })
    }
  }, 25_000)
})
