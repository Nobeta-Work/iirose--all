import type { HostWindowLike, MemberRecord } from '../types'
import { normalizeWhitespace, safeTrim } from '../utils/string'

const KEYWORD_RE = /\b(?:ai|bot|robot|agent|assistant)\b/i
const CJK_KEYWORD_RE = /人工智能|机器人|智能体|助手/
const OBJECT_TYPE_KEYS = ['type', 'kind', 'category', 'role', 'accountType', 'userType']
const BOOLEAN_HINT_KEYS = ['isAi', 'isAI', 'ai', 'isBot', 'bot', 'robot']
const TEXT_HINT_KEYS = ['intro', 'description', 'signature', 'bio', 'title', 'remark']

export function isArtificialMember(member: MemberRecord, hostWin?: HostWindowLike | null): boolean {
  const username = safeTrim(member.username)
  const uid = safeTrim(member.uid)
  const knownBots = resolveKnownBotRegistry(hostWin)

  if (uid && knownBots.uids.has(uid)) return true
  if (username && knownBots.names.has(username)) return true

  if (Array.isArray(member.raw)) {
    return isArtificialArrayMember(member.raw)
  }

  if (member.raw && typeof member.raw === 'object') {
    return isArtificialObjectMember(member.raw as Record<string, unknown>)
  }

  return false
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

function isArtificialArrayMember(raw: unknown[]): boolean {
  const accountType = safeTrim(asString(raw[1]))
  const moodText = normalizeCandidateText(asString(raw[6]))
  const extraFlag = safeTrim(asString(raw[12]))

  if (accountType === '4') return true
  if (extraFlag === '4') return true
  if (matchesArtificialText(moodText)) return true

  return false
}

function isArtificialObjectMember(raw: Record<string, unknown>): boolean {
  for (const key of BOOLEAN_HINT_KEYS) {
    if (raw[key] === true) return true
  }

  for (const key of OBJECT_TYPE_KEYS) {
    const value = normalizeCandidateText(asString(raw[key]))
    if (matchesArtificialText(value)) return true
    if (value === '4') return true
  }

  for (const key of TEXT_HINT_KEYS) {
    const value = normalizeCandidateText(asString(raw[key]))
    if (matchesArtificialText(value)) return true
  }

  return false
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
