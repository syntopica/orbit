import { describe, expect, it, vi } from 'vitest'

import { hasWebGl } from './hasWebGl'
import { readGraphPalette } from './readGraphPalette'

describe('hasWebGl', () => {
  it('reports whether a WebGL context can be created', () => {
    const getContext = vi
      .spyOn(HTMLCanvasElement.prototype, 'getContext')
      .mockReturnValue(null)
    expect(hasWebGl()).toBe(false)
    getContext.mockReturnValueOnce({} as RenderingContext)
    expect(hasWebGl()).toBe(true)
  })
})

describe('readGraphPalette', () => {
  it('reads the theme tokens and falls back when one is missing', () => {
    document.documentElement.style.setProperty('--color-series-1', '#123456')
    const palette = readGraphPalette('light')
    expect(palette.scheme).toBe('light')
    expect(palette.series[0]).toBe('#123456')
    expect(palette.series).toHaveLength(6)
    expect(palette.warn).toBe('#fbbf24')
    document.documentElement.style.removeProperty('--color-series-1')
  })
})
