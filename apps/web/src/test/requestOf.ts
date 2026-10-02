import type { Mock } from 'vitest'

export const requestOf = (
  mock: Mock<typeof fetch>,
  index: number,
): { path: string; init: RequestInit } => {
  const call = mock.mock.calls[index]
  if (typeof call?.[0] !== 'string') throw new Error('fetch call missing')
  return { path: call[0], init: call[1] ?? {} }
}
