import type { Toast } from './Toast'

export type ToastsModel = {
  readonly toasts: readonly Toast[]
  readonly dismiss: (id: string) => void
}
