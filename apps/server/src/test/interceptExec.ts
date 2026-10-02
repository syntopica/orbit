import type { DatabaseSync } from 'node:sqlite'

export const interceptExec = (
  db: DatabaseSync,
  before: (sql: string) => void,
): DatabaseSync =>
  new Proxy(db, {
    get: (target, property) => {
      if (property === 'exec') {
        return (sql: string): void => {
          before(sql)
          target.exec(sql)
        }
      }
      const value: unknown = Reflect.get(target, property)
      return typeof value === 'function'
        ? (value as (...args: unknown[]) => unknown).bind(target)
        : value
    },
  })
