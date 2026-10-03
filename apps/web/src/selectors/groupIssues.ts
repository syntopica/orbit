import type { BrainChecks } from '@orbit/contract'

import type { IssueGroup } from '../types/IssueGroup'

export const groupIssues = (issues: BrainChecks['issues']): IssueGroup[] => {
  const groups = new Map<string, string[]>()
  for (const { page, code } of issues)
    groups.set(code, [...(groups.get(code) ?? []), page])
  return [...groups]
    .map(([code, pages]) => ({ code, pages }))
    .toSorted(
      (a, b) => b.pages.length - a.pages.length || a.code.localeCompare(b.code),
    )
}
