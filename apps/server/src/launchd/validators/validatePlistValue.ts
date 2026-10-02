// A NUL or a line break has no place in a path; refuse it with a fixed error
// that never echoes the value.
export const validatePlistValue = (value: string): string => {
  if (/[\0\n\r]/u.test(value)) throw new Error('plist value is not allowed')
  return value
}
