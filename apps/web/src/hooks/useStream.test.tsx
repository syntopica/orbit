import { renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { useStream } from './useStream'

describe('useStream', () => {
  it('refuses to run outside the provider', () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
    expect(() => renderHook(() => useStream())).toThrow(
      'useStream needs <StreamProvider>',
    )
  })
})
