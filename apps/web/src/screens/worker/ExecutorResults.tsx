import type { ExecutorResultsProps } from '../../types/ExecutorResultsProps'
import { ExecutorRows } from './ExecutorRows'
import { ExecutorTable } from './ExecutorTable'

export const ExecutorResults = ({
  rows,
  now,
  isPhone,
}: ExecutorResultsProps) =>
  isPhone ? (
    <ExecutorRows rows={rows} now={now} />
  ) : (
    <ExecutorTable rows={rows} now={now} />
  )
