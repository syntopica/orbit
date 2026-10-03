import type { LayoutRequest } from '../types/LayoutRequest'
import { computeLayout } from './computeLayout'

self.addEventListener('message', (event: MessageEvent<LayoutRequest>) => {
  self.postMessage(computeLayout(event.data), {})
})
