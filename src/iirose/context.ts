import type { RuntimeContext } from '../types'
import { safeTrim } from '../utils/string'

export function resolveRuntimeContext(hostWin: Window): RuntimeContext {
  return {
    roomId: resolveCurrentRoomId(hostWin),
    selfId: resolveCurrentUserId(hostWin),
    selfUsername: resolveCurrentUsername(hostWin),
  }
}

export function resolveCurrentRoomId(hostWin: Window): string | null {
  const href = hostWin.location?.href ?? ''
  const roomMatch = href.match(/\[__([^\]]+)\]/)
  if (roomMatch) return roomMatch[1]

  const hashMatch = href.match(/[?&]room(?:Id)?=([^&#]+)/i)
  if (hashMatch) return decodeURIComponent(hashMatch[1])

  return null
}

export function resolveCurrentUsername(hostWin: Window): string | null {
  const globals = hostWin as Window & {
    myself?: unknown
    myself2?: unknown
    username?: unknown
    nickName?: unknown
  }

  for (const value of [globals.myself, globals.myself2, globals.username, globals.nickName]) {
    const normalized = safeTrim(typeof value === 'string' ? value : '')
    if (normalized) return normalized
  }

  const candidates = [
    'iirose_username',
    'iirose_user_name',
    'username',
    'nickName',
  ]

  for (const key of candidates) {
    const value = safeTrim(hostWin.localStorage?.getItem(key))
    if (value) return value
  }

  const meta = hostWin.document?.querySelector<HTMLElement>('[data-iia-self-username]')
  const fromMeta = safeTrim(meta?.dataset.iiaSelfUsername)
  if (fromMeta) return fromMeta

  return null
}

export function resolveCurrentUserId(hostWin: Window): string | null {
  const globals = hostWin as Window & {
    uid?: unknown
    iirose_uid?: unknown
    userId?: unknown
  }

  for (const value of [globals.uid, globals.iirose_uid, globals.userId]) {
    const normalized = safeTrim(typeof value === 'string' ? value : '')
    if (normalized) return normalized
  }

  const candidates = ['iirose_uid', 'iirose_user_id', 'uid', 'userId']
  for (const key of candidates) {
    const value = safeTrim(hostWin.localStorage?.getItem(key))
    if (value) return value
  }

  const meta = hostWin.document?.querySelector<HTMLElement>('[data-iia-self-id]')
  const fromMeta = safeTrim(meta?.dataset.iiaSelfId)
  if (fromMeta) return fromMeta

  return null
}
