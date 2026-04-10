import { describe, expect, it } from 'vitest'

import { sanitizeMembers } from './at-all'

describe('sanitizeMembers', () => {
  it('filters members matched by official bot constants', () => {
    const cleaned = sanitizeMembers(
      [
        { username: 'Alice', uid: 'user-1' },
        { username: '艾洛', uid: 'bot-uid' },
      ],
      {
        hostWin: {
          Constant: {
            BOT_UID: ['bot-uid'],
            BOT_NAME: ['艾洛'],
            BOT: [['艾洛', 'Ivo']],
          },
        } as never,
      },
    )

    expect(cleaned).toEqual([{ username: 'Alice', uid: 'user-1' }])
  })

  it('filters members matched by runtime raw markers', () => {
    const cleaned = sanitizeMembers([
      { username: 'Human', uid: 'user-1', raw: ['', '1', 'Human', '', '', '', 'hello'] },
      { username: 'RoomAI', uid: 'user-2', raw: ['', '4', 'RoomAI'] },
      { username: 'ScriptBot', uid: 'user-3', raw: ['', '1', 'ScriptBot', '', '', '', 'Bot of Koishi'] },
      { username: 'TaggedAI', uid: 'user-4', raw: ['', '1', 'TaggedAI', '', '', '', '', '', '', '', '', '', '4'] },
    ])

    expect(cleaned).toEqual([{ username: 'Human', uid: 'user-1', raw: ['', '1', 'Human', '', '', '', 'hello'] }])
  })
})
