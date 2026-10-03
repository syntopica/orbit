import { spawn } from 'node:child_process'
import { chmod, copyFile, mkdir, rm, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

import { assertPortFree } from './support/assertPortFree'
import { E2E } from './support/paths'
import { runOrbit } from './support/runOrbit'
import { startFakeWorker } from './support/startFakeWorker'

const waitForServer = async (): Promise<void> => {
  for (let attempt = 0; attempt < 50; attempt += 1) {
    const up = await fetch(`${E2E.baseURL}/api/snapshots`).then(
      () => true,
      () => false,
    )
    if (up) return
    await new Promise((resolve) => setTimeout(resolve, 200))
  }
  throw new Error('orbit did not start')
}

export default async function globalSetup(): Promise<() => Promise<void>> {
  await assertPortFree()
  await rm(E2E.root, { recursive: true, force: true })
  await mkdir(E2E.stateDir, { recursive: true, mode: 0o700 })
  const launchctl = join(E2E.fixtures, 'bin', 'launchctl.mjs')
  await chmod(launchctl, 0o755)
  const engineRoot = (name: string): string => join(E2E.root, 'engines', name)
  for (const name of ['brain', 'clips']) {
    await mkdir(join(engineRoot(name), 'bin'), { recursive: true })
    const target = join(engineRoot(name), 'bin', name)
    await copyFile(join(E2E.fixtures, 'bin', `${name}.mjs`), target)
    await chmod(target, 0o755)
  }
  await writeFile(
    join(E2E.data, 'syntopica.config.json'),
    JSON.stringify({
      schemaVersion: 1,
      engines: {
        brain: { path: engineRoot('brain') },
        clips: { path: engineRoot('clips') },
      },
    }),
  )
  const atriumStatusDir = join(E2E.root, 'atrium-status')
  await mkdir(atriumStatusDir, { recursive: true })
  const ago = (ms: number): string => new Date(Date.now() - ms).toISOString()
  await writeFile(
    join(atriumStatusDir, 'refresh.json'),
    JSON.stringify({
      schemaVersion: 1,
      writtenAt: ago(0),
      records: { total: 40, bySource: { 'source-a': 30, 'source-b': 10 } },
      archive: { at: ago(600_000), ageSeconds: 600, exists: true, bytes: 1 },
      refresh: { at: ago(300_000), ageSeconds: 300 },
      content: { at: ago(3_600_000), ageSeconds: 3600 },
      populations: [
        {
          model: 'model-a',
          listed: true,
          records: 5,
          episodes: 5,
          intended: 5,
          indexed: 3,
        },
      ],
    }),
  )
  await writeFile(
    join(atriumStatusDir, 'synthesis.json'),
    JSON.stringify({
      schemaVersion: 1,
      writtenAt: ago(900_000),
      lastPass: {
        producer: 'task',
        startedAt: ago(1_200_000),
        finishedAt: ago(900_000),
        conversations: 4,
        synthesized: 3,
        skipped: 0,
        failed: 0,
        deferred: 1,
      },
    }),
  )
  const workerToken = 'e2e-worker-token'
  const workerTokenFile = join(E2E.root, 'worker.token')
  await writeFile(workerTokenFile, workerToken, { mode: 0o600 })
  const worker = await startFakeWorker(workerToken)
  const plist = (label: string) =>
    join(E2E.fixtures, 'plists', `${label}.plist`)
  await writeFile(
    join(E2E.stateDir, 'orbit.json'),
    JSON.stringify({
      port: E2E.port,
      synthetic: true,
      allowedHosts: ['orbit.example.ts.net'],
      allowedLogins: ['owner@example.com'],
      worker: { url: worker.url, tokenFile: workerTokenFile },
      atrium: { statusDir: atriumStatusDir },
      engines: {
        brain: {
          command: 'bin/brain',
          subcommands: [
            ['lint', '--json'],
            ['doctor', '--json', '--skip', 'credentials'],
            ['graph', '--json', '--no-html'],
            ['graph', '--json', '--related', '--limit', '50'],
            ['page', '--json', '--id', '{pageId}'],
          ],
        },
        clips: {
          command: 'bin/clips',
          subcommands: [
            ['status', '--json'],
            ['doctor', '--json'],
          ],
        },
      },
      launchd: {
        launchctl,
        labels: [
          {
            component: 'worker',
            label: 'com.example.worker.serve',
            role: 'keepalive',
            plist: plist('com.example.worker.serve'),
          },
          {
            component: 'launchd',
            label: 'com.example.nightly',
            stage: 'curation',
            role: 'scheduled',
            plist: plist('com.example.nightly'),
          },
        ],
      },
    }),
  )
  const token =
    (await runOrbit(['token', 'create']))
      .split('\n')
      .find((line) => /^[\w-]{43}$/.test(line)) ?? ''
  await writeFile(join(E2E.root, 'token'), token)
  const server = spawn(process.execPath, [E2E.bundle, 'serve'], {
    env: {
      PATH: process.env['PATH'] ?? '',
      HOME: process.env['HOME'] ?? '',
      SYNTOPICA_DATA: E2E.data,
    },
    detached: true,
    stdio: 'ignore',
  })
  const stop = async (): Promise<void> => {
    if (server.pid !== undefined) process.kill(-server.pid, 'SIGTERM')
    await worker.stop()
  }
  try {
    await waitForServer()
  } catch (error) {
    await stop()
    throw error
  }
  return stop
}
