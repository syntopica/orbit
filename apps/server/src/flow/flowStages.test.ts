import { FLOW_STAGE_IDS } from '@orbit/contract'

import { FLOW_EDGES } from './flowEdges'
import { FLOW_STAGES } from './flowStages'

describe('flow stage data', () => {
  it('names every stage once, in flow order', () => {
    expect(FLOW_STAGES.map((stage) => stage.id)).toEqual([...FLOW_STAGE_IDS])
  })
  it('lists each backlog among its metrics and each pending key as a metric', () => {
    for (const stage of FLOW_STAGES.filter((item) => item.backlog !== null))
      expect(stage.metrics).toContain(stage.backlog)
    for (const stage of FLOW_STAGES)
      for (const key of stage.pending) expect(stage.metrics).toContain(key)
  })
  it('joins known stages and counts with an upstream metric', () => {
    const byId = new Map(FLOW_STAGES.map((stage) => [stage.id, stage]))
    for (const edge of FLOW_EDGES) {
      expect(byId.has(edge.to)).toBe(true)
      const from = byId.get(edge.from)
      expect(from).toBeDefined()
    }
    for (const edge of FLOW_EDGES.filter((item) => item.counter !== null)) {
      expect(byId.get(edge.from)?.metrics).toContain(edge.counter?.key)
    }
  })
})
