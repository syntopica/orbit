import { useRegisterEvents, useSigma } from '@react-sigma/core'
import { useEffect } from 'react'
import type { GraphEventsProps } from '../types/GraphEventsProps'

export const useGraphEvents = ({
  onSelect,
  onHover,
}: GraphEventsProps): void => {
  const register = useRegisterEvents()
  const sigma = useSigma()
  useEffect(() => {
    const container = sigma.getContainer()
    register({
      clickNode: (event) => {
        onSelect(event.node)
      },
      clickStage: () => {
        onSelect(null)
      },
      enterNode: (event) => {
        container.classList.add('cursor-pointer')
        onHover(event.node)
      },
      leaveNode: () => {
        container.classList.remove('cursor-pointer')
        onHover(null)
      },
    })
    return () => {
      container.classList.remove('cursor-pointer')
    }
  }, [register, onSelect, onHover, sigma])
}
