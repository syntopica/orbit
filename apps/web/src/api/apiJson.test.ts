import { describe, expect, it, vi } from 'vitest'
import { z } from 'zod'

import { ApiError } from './ApiError'
import { apiJson } from './apiJson'

describe('apiJson', () => {
  it('parses a body with the schema', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(Response.json({ n: 1 })))
    expect(await apiJson('/api/x', z.object({ n: z.number() }))).toEqual({
      n: 1,
    })
  })
  it('throws ApiError with the status', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(new Response(null, { status: 401 })),
    )
    await expect(apiJson('/api/x', z.object({}))).rejects.toEqual(
      new ApiError(401),
    )
  })
})
