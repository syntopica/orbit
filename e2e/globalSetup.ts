import { spawn } from 'node:child_process'
import { chmod, mkdir, rm, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

import { assertPortFree } from './support/assertPortFree'
import { E2E } from './support/paths'
import { runOrbit } from './support/runOrbit'

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
  await writeFile(
    join(E2E.data, 'syntopica.config.json'),
    JSON.stringify({ schemaVersion: 1 }),
  )
  const plist = (label: string) =>
    join(E2E.fixtures, 'plists', `${label}.plist`)
  await writeFile(
    join(E2E.stateDir, 'orbit.json'),
    JSON.stringify({
      port: E2E.port,
      synthetic: true,
      allowedHosts: ['orbit.example.ts.net'],
      allowedLogins: ['owner@example.com'],
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
  }
  try {
    await waitForServer()
  } catch (error) {
    await stop()
    throw error
  }
  return stop
}
