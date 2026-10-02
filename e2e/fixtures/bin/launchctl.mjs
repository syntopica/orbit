#!/usr/bin/env node
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const fixtures = join(
  import.meta.dirname,
  '../../../apps/server/src/adapters/launchd/fixtures',
)
const byLabel = {
  'com.example.worker.serve': 'running.txt',
  'com.example.nightly': 'failed.txt',
}
const label = (process.argv[3] ?? '').split('/').at(-1) ?? ''
const file = byLabel[label]
if (process.argv[2] !== 'print' || file === undefined) {
  process.stderr.write('Could not find service\n')
  process.exit(113)
}
process.stdout.write(readFileSync(join(fixtures, file), 'utf8'))
