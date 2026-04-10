import { getArtificialMemberReason } from '../iirose/artificial-member'
import type { HostWindowLike, MemberRecord, PublicMessagePayload } from '../types'
import { generateMessageId } from '../utils/id'
import { safeTrim } from '../utils/string'

export const TRIGGER_TOKEN = '[@全体成员]'
export const MARKDOWN_HEADER = '\\\\\\*'
export const MARKDOWN_TITLE = '### @全体成员'
export const DEFAULT_MAX_MESSAGE_LENGTH = 1800

export function hasAtAllTrigger(text: string): boolean {
  return text.includes(TRIGGER_TOKEN)
}

export function buildAtAllMessage(usernames: string[]): string {
  const mentions = usernames.map((username) => ` [*${username}*] `).join(' ')
  return `${MARKDOWN_HEADER}\n${MARKDOWN_TITLE}\n${mentions}`
}

export function isMessageTooLong(text: string, limit = DEFAULT_MAX_MESSAGE_LENGTH): boolean {
  return text.length > limit
}

export function sanitizeMembers(
  members: MemberRecord[],
  options: {
    hostWin?: HostWindowLike | null
    selfId?: string | null
    selfUsername?: string | null
  } = {},
): MemberRecord[] {
  return sanitizeMembersDetailed(members, options).cleaned
}

export function sanitizeMembersDetailed(
  members: MemberRecord[],
  options: {
    hostWin?: HostWindowLike | null
    selfId?: string | null
    selfUsername?: string | null
  } = {},
): {
  cleaned: MemberRecord[]
  excluded: Array<{ member: MemberRecord; reason: string }>
} {
  const seen = new Set<string>()
  const hostWin = options.hostWin ?? null
  const selfId = safeTrim(options.selfId)
  const selfUsername = safeTrim(options.selfUsername)
  const cleaned: MemberRecord[] = []
  const excluded: Array<{ member: MemberRecord; reason: string }> = []

  for (const member of members) {
    const username = safeTrim(member.username)
    if (!username) {
      excluded.push({ member, reason: 'blank_username' })
      continue
    }
    if (/[\r\n]/.test(username)) {
      excluded.push({ member: { ...member, username }, reason: 'invalid_username_newline' })
      continue
    }
    const artificialReason = getArtificialMemberReason({ ...member, username }, hostWin)
    if (artificialReason) {
      excluded.push({ member: { ...member, username }, reason: artificialReason })
      continue
    }
    if (selfId && member.uid && safeTrim(member.uid) === selfId) {
      excluded.push({ member: { ...member, username }, reason: 'self_uid' })
      continue
    }
    if (selfUsername && username === selfUsername) {
      excluded.push({ member: { ...member, username }, reason: 'self_username' })
      continue
    }
    if (seen.has(username)) {
      excluded.push({ member: { ...member, username }, reason: 'duplicate_username' })
      continue
    }
    seen.add(username)
    cleaned.push({ ...member, username })
  }

  return { cleaned, excluded }
}

export function buildFinalPayload(
  originalPayload: PublicMessagePayload,
  finalMessage: string,
): PublicMessagePayload {
  return {
    ...originalPayload,
    m: finalMessage,
    i: generateMessageId(),
  }
}
