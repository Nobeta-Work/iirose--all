export type MemberRecord = {
  username: string
  uid?: string
  raw?: unknown
}

export type HostWindowLike = Pick<Window, 'Constant'> & {
  Constant?: {
    BOT_UID?: unknown
    BOT_NAME?: unknown
    BOT?: unknown
  }
}

export type PublicMessagePayload = {
  m: string
  mc: string
  i?: string
  [key: string]: unknown
}

export type DraftSnapshot = {
  text: string
  element: HTMLElement | HTMLInputElement | HTMLTextAreaElement | null
}
