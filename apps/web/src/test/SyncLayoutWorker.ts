import { computeLayout } from '../layout/computeLayout'
import type { LayoutRequest } from '../types/LayoutRequest'

// Stands in for the module worker in jsdom: answers on a microtask with the
// real layout, so tests run computeLayout through the worker protocol.
export class SyncLayoutWorker {
  private readonly listeners = new Map<
    string,
    (event: { data: unknown }) => void
  >()

  addEventListener(
    type: string,
    listener: (event: { data: unknown }) => void,
  ): void {
    this.listeners.set(type, listener)
  }

  postMessage(request: LayoutRequest): void {
    queueMicrotask(() => {
      this.listeners.get('message')?.({ data: computeLayout(request) })
    })
  }

  terminate(): void {
    this.listeners.clear()
  }
}
