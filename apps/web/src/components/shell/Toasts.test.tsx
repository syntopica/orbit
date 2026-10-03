import { act, fireEvent, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import type { ComponentId } from '@orbit/contract'
import { FakeEventSource } from '../../test/FakeEventSource'
import { renderShell } from '../../test/renderShell'
import { snapshotOf } from '../../test/snapshotOf'

const source = () => FakeEventSource.instances.at(-1) as FakeEventSource
const emit = (message: unknown) => {
  act(() => {
    source().emit(message)
  })
}
const synced = async () => {
  await renderShell()
  emit({ type: 'snapshot', id: 1, snapshot: snapshotOf('worker', 'ok') })
  emit({ type: 'sync', id: 2 })
}
const down = (component: ComponentId, id: number) => {
  emit({ type: 'snapshot', id, snapshot: snapshotOf(component, 'down') })
}

describe('Toasts', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
  })
  afterEach(() => {
    vi.useRealTimers()
  })
  it('keeps at most the four newest toasts', async () => {
    await synced()
    for (const [index, id] of (
      ['worker', 'brain', 'clips', 'capture', 'atrium'] as const
    ).entries())
      down(id, 3 + index)
    const texts = screen.getAllByTestId('toast').map((t) => t.textContent)
    expect(texts).toHaveLength(4)
    expect(texts[0]).toContain('Brain')
    expect(texts[3]).toContain('Atrium')
  })
  it('announces toasts through a polite live region', async () => {
    await synced()
    down('worker', 3)
    const region = screen.getByRole('status', { name: 'Notifications' })
    expect(region).toHaveAttribute('aria-live', 'polite')
    expect(region).toContainElement(screen.getByTestId('toast'))
  })
  it('shows the reason and dismisses on request', async () => {
    await synced()
    down('worker', 3)
    expect(screen.getByTestId('toast')).toHaveTextContent('Unreachable')
    fireEvent.click(screen.getByRole('button', { name: 'Dismiss' }))
    expect(screen.queryByTestId('toast')).toBeNull()
  })
  it('expires a toast after 8 seconds, not before', async () => {
    await synced()
    down('worker', 3)
    act(() => {
      vi.advanceTimersByTime(7_999)
    })
    expect(screen.getAllByTestId('toast')).toHaveLength(1)
    act(() => {
      vi.advanceTimersByTime(1)
    })
    expect(screen.queryByTestId('toast')).toBeNull()
  })
  it('expires each toast 8 seconds after its own arrival', async () => {
    await synced()
    down('worker', 3)
    act(() => {
      vi.advanceTimersByTime(5_000)
    })
    down('brain', 4)
    act(() => {
      vi.advanceTimersByTime(3_000)
    })
    const left = screen.getAllByTestId('toast')
    expect(left).toHaveLength(1)
    expect(left[0]).toHaveTextContent('Brain')
    act(() => {
      vi.advanceTimersByTime(5_000)
    })
    expect(screen.queryByTestId('toast')).toBeNull()
  })
  it('arms one timer per toast and none after unmount', async () => {
    const view = await renderShell()
    emit({ type: 'snapshot', id: 1, snapshot: snapshotOf('worker', 'ok') })
    emit({ type: 'sync', id: 2 })
    const armed = vi.getTimerCount()
    down('worker', 3)
    down('brain', 4)
    expect(vi.getTimerCount() - armed).toBe(2)
    view.unmount()
    expect(vi.getTimerCount()).toBe(0)
  })
  it('does not toast components that were already down before a resync', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn<typeof fetch>()
        .mockResolvedValue(new Response(null, { status: 200 })),
    )
    await synced()
    down('worker', 3)
    act(() => {
      vi.advanceTimersByTime(8_000)
    })
    const first = source()
    first.close()
    act(() => {
      first.onerror?.()
    })
    await act(async () => {
      await vi.advanceTimersByTimeAsync(5_000)
    })
    const reopened = source()
    expect(reopened).not.toBe(first)
    act(() => {
      reopened.onopen?.()
    })
    down('worker', 10)
    emit({ type: 'sync', id: 11 })
    expect(screen.queryByTestId('toast')).toBeNull()
    down('brain', 12)
    expect(screen.getAllByTestId('toast')).toHaveLength(1)
  })
})
