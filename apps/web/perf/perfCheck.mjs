// Lighthouse against the built app under `vite preview`, failing when a
// category scores under its floor. Replaces Lighthouse CI (`@lhci/cli`), whose
// last release (0.15.1, June 2025) still pulls 14 advisories; `lighthouse`
// itself has none. Needs a local Chrome (or CHROME_PATH); headless, temporary
// profile. Only the login screen renders without the server, as under LHCI.
import { spawn } from 'node:child_process'
import { setTimeout as delay } from 'node:timers/promises'

const PORT = 4179
const URL = `http://127.0.0.1:${String(PORT)}/`
const FLOORS = {
  performance: 0.9,
  accessibility: 1,
  'best-practices': 0.9,
}

const preview = spawn(
  'pnpm',
  [
    'exec',
    'vite',
    'preview',
    '--host',
    '127.0.0.1',
    '--port',
    String(PORT),
    '--strictPort',
  ],
  { stdio: 'ignore', detached: true },
)

const stopPreview = () => {
  try {
    process.kill(-preview.pid, 'SIGTERM')
  } catch {
    // Already gone.
  }
}

const waitForPreview = async () => {
  for (let attempt = 0; attempt < 60; attempt += 1) {
    const ok = await fetch(URL).then(
      (r) => r.ok,
      () => false,
    )
    if (ok) return
    await delay(500)
  }
  throw new Error(`vite preview did not answer on ${URL}`)
}

const runLighthouse = async () =>
  new Promise((resolve, reject) => {
    const categories = Object.keys(FLOORS).join(',')
    const child = spawn(
      'pnpm',
      [
        'exec',
        'lighthouse',
        URL,
        '--quiet',
        '--output=json',
        '--output-path=stdout',
        `--only-categories=${categories}`,
        '--chrome-flags=--headless=new',
      ],
      { stdio: ['ignore', 'pipe', 'inherit'] },
    )
    let out = ''
    child.stdout.on('data', (chunk) => {
      out += String(chunk)
    })
    child.on('error', reject)
    child.on('close', (code) => {
      if (code === 0) resolve(JSON.parse(out))
      else reject(new Error(`lighthouse exited ${String(code)}`))
    })
  })

try {
  await waitForPreview()
  const report = await runLighthouse()
  let failed = false
  for (const [id, floor] of Object.entries(FLOORS)) {
    const score = report.categories[id]?.score ?? 0
    const pass = score >= floor
    failed ||= !pass
    console.log(
      `${pass ? 'ok  ' : 'FAIL'} ${id} ${score.toFixed(2)} (floor ${floor.toFixed(2)})`,
    )
  }
  process.exitCode = failed ? 1 : 0
} finally {
  stopPreview()
}
