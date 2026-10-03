import { afterEach, describe, expect, it, vi } from 'vitest'

import { canRenderOrbit3d } from './canRenderOrbit3d'

describe('canRenderOrbit3d', () => {
  afterEach(() => vi.restoreAllMocks())

  it('selects the SVG for reduced motion and absent WebGL', () => {
    expect(canRenderOrbit3d(true)).toBe(false)
    expect(canRenderOrbit3d(false)).toBe(false)
  })

  it('accepts a WebGL context', () => {
    vi.stubGlobal('WebGLRenderingContext', vi.fn())
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(
      {} as WebGLRenderingContext,
    )
    expect(canRenderOrbit3d(false)).toBe(true)
    vi.unstubAllGlobals()
  })
})
