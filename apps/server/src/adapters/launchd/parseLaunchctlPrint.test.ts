import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { parseExitCode } from './parseExitCode'
import { parseLaunchctlPrint } from './parseLaunchctlPrint'

const fixture = (name: string) =>
  readFileSync(join(import.meta.dirname, 'fixtures', name), 'utf8')

describe('parseLaunchctlPrint', () => {
  it('reads a running keepalive job and ignores nested state lines', () => {
    expect(parseLaunchctlPrint(fixture('running.txt'))).toEqual({
      state: 'running',
      pid: 5627,
      runs: 26,
      lastExit: null,
    })
  })
  it('reads a scheduled job between runs', () => {
    expect(parseLaunchctlPrint(fixture('scheduled.txt'))).toEqual({
      state: 'not running',
      pid: null,
      runs: 38,
      lastExit: 0,
    })
  })
  it('reads a named exit code', () => {
    expect(parseLaunchctlPrint(fixture('failed.txt')).lastExit).toBe(78)
  })
  it('reads a signalled job as running with no exit', () => {
    expect(parseLaunchctlPrint(fixture('signalled.txt'))).toMatchObject({
      pid: 86643,
      lastExit: null,
    })
  })
  it('fails closed on an unrecognised format', () => {
    expect(() => parseLaunchctlPrint('nothing here')).toThrow('schema_invalid')
  })
  it('does not read a nested two-tab state as the top-level state', () => {
    expect(() =>
      parseLaunchctlPrint(
        'gui/501/x = {\n\tendpoints = {\n\t\tstate = active\n\t}\n}\n',
      ),
    ).toThrow('schema_invalid')
  })
  it('keeps the first top-level value of a repeated key', () => {
    expect(
      parseLaunchctlPrint('x = {\n\tstate = running\n\tstate = waiting\n}\n')
        .state,
    ).toBe('running')
  })
})

describe('parseExitCode', () => {
  it('handles plain, named and never-exited values', () => {
    expect(parseExitCode('0')).toBe(0)
    expect(parseExitCode('78: EX_CONFIG')).toBe(78)
    expect(parseExitCode('(never exited)')).toBeNull()
  })
  it('handles negative codes', () => {
    expect(parseExitCode('-9')).toBe(-9)
  })
})
