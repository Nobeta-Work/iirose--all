import type { HostWindowLike, MemberRecord } from '../types'
import { normalizeWhitespace, safeTrim } from '../utils/string'

const KEYWORD_RE = /\b(?:ai|bot|robot|agent|assistant)\b/i
const CJK_KEYWORD_RE = /人工智能|机器人|智能体|助手/
const OBJECT_TYPE_KEYS = ['type', 'kind', 'category', 'role', 'accountType', 'userType']
const BOOLEAN_HINT_KEYS = ['isAi', 'isAI', 'ai', 'isBot', 'bot', 'robot']
const TEXT_HINT_KEYS = ['intro', 'description', 'signature', 'bio', 'title', 'remark']

export function isArtificialMember(member: MemberRecord, hostWin?: HostWindowLike | null): boolean {
  return getArtificialMemberReason(member, hostWin) !== null
}

export function getArtificialMemberReason(member: MemberRecord, hostWin?: HostWindowLike | null): string | null {
  const username = safeTrim(member.username)
  const uid = safeTrim(member.uid)
  const knownBots = resolveKnownBotRegistry(hostWin)

  if (uid && knownBots.uids.has(uid)) return 'known_bot_uid'
  if (username && knownBots.names.has(username)) return 'known_bot_name'

  if (Array.isArray(member.raw)) {
    return getArtificialArrayMemberReason(member.raw)
  }

  if (member.raw && typeof member.raw === 'object') {
    return getArtificialObjectMemberReason(member.raw as Record<string, unknown>)
  }

  return null
}

function resolveKnownBotRegistry(hostWin?: HostWindowLike | null): { uids: Set<string>; names: Set<string> } {
  const constant = hostWin?.Constant
  const uids = new Set<string>(collectStrings(constant?.BOT_UID))
  const names = new Set<string>(collectStrings(constant?.BOT_NAME))

  const aliases = constant?.BOT
  if (Array.isArray(aliases)) {
    for (const group of aliases) {
      for (const value of collectStrings(group)) {
        names.add(value)
      }
    }
  }

  return { uids, names }
}

function getArtificialArrayMemberReason(raw: unknown[]): string | null {
  const accountType = safeTrim(asString(raw[1]))
  const moodText = normalizeCandidateText(asString(raw[6]))

  if (accountType === '4') return 'raw_account_type_4'
  if (matchesArtificialText(moodText)) return 'raw_mood_keyword'

  return null
}

function getArtificialObjectMemberReason(raw: Record<string, unknown>): string | null {
  for (const key of BOOLEAN_HINT_KEYS) {
    if (raw[key] === true) return `raw_boolean_flag:${key}`
  }

  for (const key of OBJECT_TYPE_KEYS) {
    const value = normalizeCandidateText(asString(raw[key]))
    if (matchesArtificialText(value)) return `raw_object_type_keyword:${key}`
  }

  for (const key of TEXT_HINT_KEYS) {
    const value = normalizeCandidateText(asString(raw[key]))
    if (matchesArtificialText(value)) return `raw_text_keyword:${key}`
  }

  return null
}

function matchesArtificialText(value: string): boolean {
  if (!value) return false
  return KEYWORD_RE.test(value) || CJK_KEYWORD_RE.test(value)
}

function normalizeCandidateText(value: string): string {
  return normalizeWhitespace(value).toLowerCase()
}

function collectStrings(input: unknown): string[] {
  if (!Array.isArray(input)) return []
  return input
    .map((value) => safeTrim(asString(value)))
    .filter(Boolean)
}

function asString(value: unknown): string {
  return typeof value === 'string' ? value : ''
}
