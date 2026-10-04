import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect, useMemo, useState } from 'react'

import { fetchWorkerJobContent } from '../api/fetchWorkerJobContent'

export const useWorkerJobContent = (id: string, privacy: string) => {
  const client = useQueryClient()
  const key = useMemo(() => ['worker-job-content', id], [id])
  const [open, setOpen] = useState(false)
  const hide = useCallback(() => {
    setOpen(false)
    void client.cancelQueries({ queryKey: key, exact: true })
    client.removeQueries({ queryKey: key, exact: true })
  }, [client, key])
  useEffect(() => {
    if (!open) return undefined
    const timer = window.setTimeout(hide, 60_000)
    return () => {
      window.clearTimeout(timer)
    }
  }, [hide, open])
  useEffect(() => {
    const onVisibility = () => {
      if (document.hidden) hide()
    }
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      document.removeEventListener('visibilitychange', onVisibility)
      void client.cancelQueries({ queryKey: key, exact: true })
      client.removeQueries({ queryKey: key, exact: true })
    }
  }, [client, hide, key])
  const query = useQuery({
    queryKey: key,
    queryFn: async ({ signal }) => fetchWorkerJobContent(id, privacy, signal),
    enabled: open,
    gcTime: 0,
    staleTime: Infinity,
    retry: false,
    refetchOnWindowFocus: false,
  })
  return {
    open,
    show: () => {
      setOpen(true)
    },
    hide,
    query,
  }
}
