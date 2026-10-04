import { workerJobListSchema } from '@orbit/contract'
import { useQuery } from '@tanstack/react-query'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { useState, type SubmitEvent } from 'react'

import { apiJson } from '../api/apiJson'
import { getFormText } from '../handlers/getFormText'
import { validateWorkerJobsSearch } from '../validators/validateWorkerJobsSearch'
import { useMediaQuery } from './useMediaQuery'

export const useWorkerJobsScreen = () => {
  const filters = validateWorkerJobsSearch(useSearch({ strict: false }))
  const navigate = useNavigate()
  const isPhone = useMediaQuery('(max-width: 767px)')
  const params = new URLSearchParams(filters)
  const [reading, setReading] = useState(false)
  const jobs = useQuery({
    queryKey: ['worker-jobs', params.toString()],
    queryFn: async () =>
      apiJson(`/api/worker/jobs?${params.toString()}`, workerJobListSchema),
    refetchInterval: 15_000,
  })
  const reread = async () => {
    setReading(true)
    await jobs.refetch()
    setReading(false)
  }
  // Unchanged filters still read again, so a submit always shows a result.
  const apply = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const queue = getFormText(form, 'queue')
    const state = getFormText(form, 'state')
    const producer = getFormText(form, 'producer')
    const search = {
      ...(queue ? { queue } : {}),
      ...(state ? { state } : {}),
      ...(producer ? { producer } : {}),
    }
    if (new URLSearchParams(search).toString() !== params.toString()) {
      void navigate({ to: '/worker/jobs', search })
      return
    }
    void reread()
  }
  const older = () => {
    const before = jobs.data?.next
    if (before === null || before === undefined) return
    void navigate({ to: '/worker/jobs', search: { ...filters, before } })
  }
  return { filters, apply, older, jobs, isPhone, reading }
}
