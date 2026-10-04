import { describe, expect, it } from 'vitest'

import { workerResultReportSchema } from '../adapters/worker/workerResultReportSchema'
import { toResultView } from './toResultView'

const answered = workerResultReportSchema.parse({
  result_id: 'result-1',
  control: null,
  detail: null,
  executor: { node: 'node-a', provider: 'ollama', model: 'model-a' },
  usage: { tokens_in: 4, tokens_out: 2, cost_usd: 0 },
  rating: 'good',
  created: 3,
  acked: null,
})

describe('toResultView', () => {
  it('keeps the executor, usage and rating of an answer, never its output', () => {
    const parsed = workerResultReportSchema.parse({
      ...answered,
      output: { text: 'private' },
    })
    expect(toResultView(parsed)).toEqual({
      resultId: 'result-1',
      control: null,
      error: null,
      schemaPath: null,
      node: 'node-a',
      provider: 'ollama',
      model: 'model-a',
      tokensIn: 4,
      tokensOut: 2,
      costUsd: 0,
      rating: 'good',
      createdAt: 3000,
      ackedAt: null,
    })
  })
  it('reads the allowlisted detail of a control result and strips the rest', () => {
    const control = workerResultReportSchema.parse({
      ...answered,
      control: 'failed',
      detail: { error: 'schema_violation', schema_path: '/a/0', note: 'x' },
      executor: null,
      usage: null,
      rating: null,
      acked: 4,
    })
    expect(control.detail).toEqual({
      error: 'schema_violation',
      schema_path: '/a/0',
    })
    expect(toResultView(control)).toMatchObject({
      control: 'failed',
      error: 'schema_violation',
      schemaPath: '/a/0',
      node: null,
      tokensIn: null,
      ackedAt: 4000,
    })
  })
  it('blanks an empty task model and drops a result without a valid id', () => {
    const task = { ...answered, executor: { node: 'node-a', model: '' } }
    expect(toResultView(task)?.model).toBeNull()
    expect(toResultView({ ...answered, result_id: 'bad id' })).toBeNull()
  })
})
