import type { FlowStageId } from '@orbit/contract'

// Plain-language explanations for the side panel (spec 3.3, 7 item 3).
export const FLOW_STAGE_LABELS: Record<
  FlowStageId,
  { readonly title: string; readonly explanation: string }
> = {
  archive: {
    title: 'Archive',
    explanation:
      "Agent sessions are exported into the conversation archive, hourly through atrium's refresh job.",
  },
  episodes: {
    title: 'Session-stop hook',
    explanation:
      'When a session ends, the stop hook records an episode for it if one is owed. orbit can only age this stage by a launchd label registered for it.',
  },
  synthesis: {
    title: 'Synthesis',
    explanation:
      'Atrium synthesis turns the remaining sessions into episodes on a schedule, through lanes that include the worker. Deferred sessions wait for a later pass.',
  },
  clips: {
    title: 'Clips',
    explanation:
      'Clips arrive through the browser clipper, the capture API and newsletter harvest, are triaged and graded through the worker, and are ingested into brain pages behind a validator.',
  },
  curation: {
    title: 'Curation',
    explanation:
      'Atrium curation turns episodes into claim ledgers and review sheets; a person edits brain pages from them.',
  },
  brain: {
    title: 'Brain upkeep',
    explanation:
      'Brain index, lint and graph keep the links between pages healthy.',
  },
  index: {
    title: 'Index',
    explanation:
      'Atrium refresh ingests the archive, synthesis and brain notes and embeds them. A record that is not in the index cannot be retrieved.',
  },
  retrieval: {
    title: 'Retrieval',
    explanation:
      'Context returns to sessions through the prompt hook and the MCP tools. Its freshness is the age of the newest indexed content.',
  },
}
