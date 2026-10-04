import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'

import { apiJson } from '../api/apiJson'
import { postAction } from '../api/postAction'
import { actionRunsSchema } from '../schemas/actionRunsSchema'

export const useActionRun = (path: string) => {
  const [selected, setSelected] = useState(false)
  const [id, setId] = useState<string | null>(null)
  const [error, setError] = useState(false)
  const [sending, setSending] = useState(false)
  const runs = useQuery({
    queryKey: ['actions'],
    queryFn: async () => apiJson('/api/actions', actionRunsSchema),
    enabled: id !== null,
    refetchInterval: id === null ? false : 1000,
  })
  const current = runs.data?.runs.find((run) => run.id === id)
  const confirm = async () => {
    setSending(true)
    setError(false)
    try {
      setId(await postAction(path))
      setSelected(false)
      await runs.refetch()
    } catch {
      setError(true)
    } finally {
      setSending(false)
    }
  }
  return {
    selected,
    select: () => {
      setSelected(true)
    },
    close: () => {
      setSelected(false)
      setError(false)
    },
    confirm,
    error,
    sending,
    id,
    current,
  }
}
