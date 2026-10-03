import { useRegisterEvents, useSigma } from '@react-sigma/core'
import { useEffect } from 'react'
import type { GraphEventsProps } from '../types/GraphEventsProps'

export const useGraphEvents = ({ onSelect }: GraphEventsProps): void => {
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
      enterNode: () => {
        container.classList.add('cursor-pointer')
      },
      leaveNode: () => {
        container.classList.remove('cursor-pointer')
      },
    })
    return () => {
      container.classList.remove('cursor-pointer')
    }
  }, [register, onSelect, sigma])
}
