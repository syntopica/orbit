// Groups the viewer opened or closed by hand, valid for one filter set.
export type PendingGroupOverrides = {
  readonly key: string
  readonly open: Readonly<Record<string, boolean>>
}
