import { workerJobListSchema } from '@orbit/contract'
import { useQuery } from '@tanstack/react-query'
import { useNavigate, useSearch } from '@tanstack/react-router'
import type { SubmitEvent } from 'react'

import { apiJson } from '../api/apiJson'
import { getFormText } from '../handlers/getFormText'
import { validateWorkerJobsSearch } from '../validators/validateWorkerJobsSearch'

export const useWorkerJobsScreen = () => {
  const filters = validateWorkerJobsSearch(useSearch({ strict: false }))
  const navigate = useNavigate()
  const params = new URLSearchParams(filters)
  const jobs = useQuery({
    queryKey: ['worker-jobs', params.toString()],
    queryFn: async () =>
      apiJson(`/api/worker/jobs?${params.toString()}`, workerJobListSchema),
    refetchInterval: 15_000,
  })
  const apply = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const queue = getFormText(form, 'queue')
    const state = getFormText(form, 'state')
    const producer = getFormText(form, 'producer')
    void navigate({
      to: '/worker/jobs',
      search: {
        ...(queue ? { queue } : {}),
        ...(state ? { state } : {}),
        ...(producer ? { producer } : {}),
      },
    })
  }
  const older = () => {
    const before = jobs.data?.next
    if (before === null || before === undefined) return
    void navigate({ to: '/worker/jobs', search: { ...filters, before } })
  }
  return {
    filters,
    apply,
    older,
    jobs,
  }
}
