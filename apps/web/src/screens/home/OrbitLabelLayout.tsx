import { useOrbitLabelLayout } from '../../hooks/useOrbitLabelLayout'

export const OrbitLabelLayout = ({
  labels,
}: {
  readonly labels: readonly React.RefObject<HTMLAnchorElement | null>[]
}) => {
  useOrbitLabelLayout(labels)
  return null
}
