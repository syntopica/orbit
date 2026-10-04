import type { ActionExecutionContext } from '../types/ActionExecutionContext'
import type { ActionRun } from '../types/ActionRun'
import type { ActionStore } from '../types/ActionStore'
import { publishActionEvent } from './publishActionEvent'

export const executeActionRun = async (
  input: Parameters<ActionStore['start']>[0],
  signal: AbortSignal,
  started: ActionRun,
  context: ActionExecutionContext,
): Promise<void> => {
  let exitCode = -1
  try {
    exitCode = (await input.run(signal)).code
  } catch {
    // The failure is reported as metadata only.
  }
  const completed: ActionRun = {
    ...started,
    state: exitCode === 0 ? 'succeeded' : 'failed',
    exitCode,
    durationMs: context.now() - started.startedAt,
  }
  const index = context.history.findIndex((run) => run.id === started.id)
  if (index >= 0) context.history.splice(index, 1, completed)
  context.active.delete(input.key)
  publishActionEvent(context.hub, context.now, completed, input.component)
}
