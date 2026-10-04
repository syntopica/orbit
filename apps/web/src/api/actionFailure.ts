import { StepUpRequiredError } from './StepUpRequiredError'

export const actionFailure = async (response: Response): Promise<Error> => {
  if (response.status === 403) {
    const body: unknown = await response.json().catch(() => null)
    if (
      typeof body === 'object' &&
      body !== null &&
      'error' in body &&
      body.error === 'step_up_required'
    )
      return new StepUpRequiredError()
  }
  return new Error(String(response.status))
}
