import { memoryFlowSchema } from './memoryFlowSchema'

const stage = {
  id: 'index',
  component: 'atrium',
  state: 'ok',
  freshAt: 1_789_999_000_000,
  policyMs: 7_200_000,
  label: 'com.example.refresh',
  lastRunAt: null,
  backlog: { key: 'atrium.not_indexed', value: 2 },
  metrics: [{ key: 'atrium.not_indexed', value: 2 }],
  pending: [{ key: 'atrium.not_indexed', count: 2, oldestAt: null }],
}
const flow = {
  now: 1_790_000_000_000,
  stages: [stage],
  edges: [{ from: 'index', to: 'retrieval', perHour: null, flowing: false }],
}

describe('memoryFlowSchema', () => {
  it('accepts a flow', () => {
    expect(memoryFlowSchema.parse(flow)).toEqual(flow)
  })
  it('rejects an unknown stage or a label that is not an identifier', () => {
    const edges = [{ from: 'index', to: 'nowhere', perHour: 1, flowing: true }]
    expect(() => memoryFlowSchema.parse({ ...flow, edges })).toThrow()
    const stages = [{ ...stage, label: 'a label' }]
    expect(() => memoryFlowSchema.parse({ ...flow, stages })).toThrow()
  })
})
