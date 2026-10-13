import type { useJobContentPanel } from '../hooks/useJobContentPanel'

export type RevealedJobContentProps = {
  readonly model: ReturnType<typeof useJobContentPanel>
}
