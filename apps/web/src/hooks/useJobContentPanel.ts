import type { WorkerJobDetail } from '@orbit/contract'

import { formatJobContent } from '../formatters/formatJobContent'
import { useStepUpPrompt } from './useStepUpPrompt'
import { useWorkerJobContent } from './useWorkerJobContent'

export const useJobContentPanel = (job: WorkerJobDetail) => {
  const content = useWorkerJobContent(job.id, job.privacy)
  const stepUp = useStepUpPrompt(content.show)
  const show = () => {
    if (job.privacy === 'secret') stepUp.openPrompt()
    else content.show()
  }
  const inputText = formatJobContent(content.query.data?.input)
  const outputText = formatJobContent(content.query.data?.output)
  const copy = (text: string) => {
    void navigator.clipboard.writeText(text)
  }
  return { content, show, inputText, outputText, copy, ...stepUp }
}
