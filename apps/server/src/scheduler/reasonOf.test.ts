import { z } from 'zod'

import { ProcessError } from '../process/ProcessError'
import { reasonOf } from './reasonOf'

describe('reasonOf', () => {
  it('maps known failures to closed reason codes', () => {
    expect(reasonOf(new ProcessError('output_too_large'))).toBe(
      'output_too_large',
    )
    expect(reasonOf(z.number().safeParse('x').error)).toBe('schema_invalid')
    expect(reasonOf(new DOMException('t', 'TimeoutError'))).toBe('timeout')
    expect(reasonOf(new Error('anything'))).toBe('unreachable')
  })
})
