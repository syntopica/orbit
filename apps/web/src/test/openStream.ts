import { act } from '@testing-library/react'

import { FakeEventSource } from './FakeEventSource'

export const openStream = (): FakeEventSource => {
  const source = FakeEventSource.instances.at(-1)
  if (source === undefined) throw new Error('no EventSource was opened')
  act(() => {
    source.onopen?.()
  })
  return source
}
