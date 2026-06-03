// i18n aggregator — merges per-namespace dictionaries into one lookup table.
// Each page/component owns its own dict file under ./dict to keep ownership clear
// and avoid one giant file. Keys are plain strings, namespaced by convention
// (e.g. "home.startExplore", "nav.overview").

import { common } from './dict/common'
import { home } from './dict/home'
import { layout } from './dict/layout'
import { overview } from './dict/overview'
import { mainflow } from './dict/mainflow'
import { showcase } from './dict/showcase'
import { takeaway } from './dict/takeaway'
import { learningPath } from './dict/learningPath'
import { analyze } from './dict/analyze'
import { evolution } from './dict/evolution'
import { agentTrace } from './dict/agentTrace'
import { chatSidebar } from './dict/chatSidebar'

export type Lang = 'en' | 'zh'
export type Entry = { en: string; zh: string }
export type Dict = Record<string, Entry>

export const translations: Dict = {
  ...common,
  ...home,
  ...layout,
  ...overview,
  ...mainflow,
  ...showcase,
  ...takeaway,
  ...learningPath,
  ...analyze,
  ...evolution,
  ...agentTrace,
  ...chatSidebar,
}

export type TranslationKey = string
