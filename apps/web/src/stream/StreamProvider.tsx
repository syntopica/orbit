import { StreamContext } from '../contexts/StreamContext'
import { useStreamConnection } from '../hooks/useStreamConnection'
import type { ChildrenProps } from '../types/ChildrenProps'

export const StreamProvider = ({ children }: ChildrenProps) => {
  const value = useStreamConnection()
  return <StreamContext value={value}>{children}</StreamContext>
}
