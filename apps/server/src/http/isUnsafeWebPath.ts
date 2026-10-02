// A request path (already URI-decoded by Hono) that could leave webRoot or
// smuggle a separator: dot segments, backslashes, doubled slashes, NUL, or any
// percent sign left over after decoding.
export const isUnsafeWebPath = (path: string): boolean =>
  !path.startsWith('/') ||
  /[\\%\0]|\/\//.test(path) ||
  path.split('/').some((segment) => segment === '.' || segment === '..')
