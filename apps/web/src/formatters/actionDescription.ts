export const actionDescription = (action: string): string =>
  action === 'restart'
    ? 'Restart, interrupting any work it holds'
    : action === 'run'
      ? 'Run now'
      : 'Run action'
