import { COMPONENT_IDS, type ComponentId } from '@orbit/contract'
import { z } from 'zod'

// Every metric and pending key is `<component>.<name>`.
export const componentOf = (key: string): ComponentId =>
  z.enum(COMPONENT_IDS).parse(key.slice(0, key.indexOf('.')))
