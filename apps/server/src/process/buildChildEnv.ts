export const buildChildEnv = (
  source: NodeJS.ProcessEnv,
  extra: Readonly<Record<string, string>>,
): Record<string, string> => {
  const allowed = ['PATH', 'HOME', 'SYNTOPICA_DATA', 'LANG']
  const kept = allowed.flatMap((name) => {
    const value = source[name]
    return value === undefined ? [] : [[name, value] as const]
  })
  return { ...Object.fromEntries(kept), ...extra }
}
