export type NavItem = {
  readonly to:
    | '/'
    | '/memory'
    | '/atrium'
    | '/brain'
    | '/clips'
    | '/worker'
    | '/pending'
    | '/system'
  readonly label: string
}
