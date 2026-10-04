// The server wants the admin token re-entered before this action (remote
// sessions only); the caller asks for it and retries.
export class StepUpRequiredError extends Error {
  constructor() {
    super('step_up_required')
    this.name = 'StepUpRequiredError'
  }
}
