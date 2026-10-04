import type { WorkerJobDetail } from '@orbit/contract'

import { useStepUpPrompt } from './useStepUpPrompt'
import { useWorkerJobContent } from './useWorkerJobContent'

export const useJobContentPanel = (job: WorkerJobDetail) => {
  const content = useWorkerJobContent(job.id, job.privacy)
  const stepUp = useStepUpPrompt(content.show)
  const show = () => {
    if (job.privacy === 'secret') stepUp.openPrompt()
    else content.show()
  }
  const text =
    content.query.data === undefined
      ? ''
      : JSON.stringify(content.query.data, null, 2)
  const copy = () => {
    void navigator.clipboard.writeText(text)
  }
  return { content, show, text, copy, ...stepUp }
}
