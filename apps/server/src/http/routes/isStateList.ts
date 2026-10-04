import { isIdentifier } from '../../workerView/isIdentifier'

// One job state or a comma-separated list of them (`leased,running,draining`
// is what runs now); each one must be an identifier. The worker knows 13
// states, so a longer list cannot be a real filter.
export const isStateList = (value: string): boolean => {
  const states = value.split(',')
  return states.length <= 13 && states.every(isIdentifier)
}
