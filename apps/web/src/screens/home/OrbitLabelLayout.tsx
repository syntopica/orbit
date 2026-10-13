import { useOrbitLabelLayout } from '../../hooks/useOrbitLabelLayout'
import type { OrbitLabelLayoutProps } from '../../types/OrbitLabelLayoutProps'

export const OrbitLabelLayout = ({
  labels,
  leaders,
}: OrbitLabelLayoutProps) => {
  useOrbitLabelLayout(labels, leaders)
  return null
}
