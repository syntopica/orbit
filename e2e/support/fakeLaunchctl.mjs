#!/usr/bin/env node
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const fixtures = join(
  import.meta.dirname,
  '../fixtures/bin/../../../apps/server/src/adapters/launchd/fixtures',
)
const byLabel = {
  'com.example.worker.serve': 'running.txt',
  'com.example.nightly': 'failed.txt',
}
const args = process.argv.slice(2)
const label = (args.at(-1) ?? '').split('/').at(-1) ?? ''
if (args[0] === 'kickstart') {
  process.stdout.write('PRIVATE ACTION OUTPUT')
  process.exit(label.endsWith('.fail') ? 1 : 0)
}
const file = byLabel[label]
if (args[0] !== 'print' || file === undefined) {
  process.stderr.write('Could not find service\n')
  process.exit(113)
}
process.stdout.write(readFileSync(join(fixtures, file), 'utf8'))
