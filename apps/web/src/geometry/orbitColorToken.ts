import type { CardModel } from '../types/CardModel'

export const orbitColorToken = (
  card: Pick<CardModel, 'state' | 'greyed'>,
): string => (card.greyed ? '--color-unknown' : `--color-${card.state}`)
