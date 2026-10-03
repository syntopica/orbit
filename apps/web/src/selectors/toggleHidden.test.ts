import { describe, expect, it } from 'vitest'

import { toggleHidden } from './toggleHidden'

describe('toggleHidden', () => {
  it('hides a shown type and shows a hidden one', () => {
    expect(toggleHidden(['a'], 'b')).toEqual(['a', 'b'])
    expect(toggleHidden(['a', 'b'], 'a')).toEqual(['b'])
  })
})
