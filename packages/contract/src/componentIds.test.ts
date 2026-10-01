import { COMPONENT_IDS } from './componentIds'

describe('COMPONENT_IDS', () => {
  it('lists each component once', () => {
    expect(new Set(COMPONENT_IDS).size).toBe(COMPONENT_IDS.length)
  })
})
