import { act } from '@testing-library/react'

import { FakeEventSource } from './FakeEventSource'

export const openStream = (): FakeEventSource => {
  const source = FakeEventSource.instances.at(-1) as FakeEventSource
  act(() => {
    source.onopen?.()
  })
  return source
}
