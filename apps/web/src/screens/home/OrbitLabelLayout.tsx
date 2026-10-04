import { useOrbitLabelLayout } from '../../hooks/useOrbitLabelLayout'

export const OrbitLabelLayout = ({
  labels,
  leaders,
}: {
  readonly labels: readonly React.RefObject<HTMLAnchorElement | null>[]
  readonly leaders: readonly React.RefObject<SVGPathElement | null>[]
}) => {
  useOrbitLabelLayout(labels, leaders)
  return null
}
