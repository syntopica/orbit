import { buildStageLabels } from './buildStageLabels'

const entry = (label: string, stage?: 'index' | 'synthesis') => ({
  component: 'atrium' as const,
  label,
  role: 'scheduled' as const,
  plist: '/x.plist',
  ...(stage === undefined ? {} : { stage }),
})

describe('buildStageLabels', () => {
  it('maps each stage to the first label naming it', () => {
    expect(
      buildStageLabels([
        entry('com.example.plain'),
        entry('com.example.refresh', 'index'),
        entry('com.example.second', 'index'),
        entry('com.example.synth', 'synthesis'),
      ]),
    ).toEqual(
      new Map([
        ['index', 'com.example.refresh'],
        ['synthesis', 'com.example.synth'],
      ]),
    )
  })
})
