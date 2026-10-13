export type TodoItemValues = {
  readonly state: 'open' | 'partial' | 'blocked'
  readonly title: string
  readonly section: string | null
}
