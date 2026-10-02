import { describe, expect, it } from 'vitest'

import { parseStreamData } from './parseStreamData'

describe('parseStreamData', () => {
  it('accepts a valid message', () => {
    expect(parseStreamData('{"type":"sync","id":3}')).toEqual({
      type: 'sync',
      id: 3,
    })
  })
  it.each(['not json', '{"type":"sync"}', '{"type":"nope","id":1}'])(
    'rejects %j',
    (data) => {
      expect(parseStreamData(data)).toBeNull()
    },
  )
})
