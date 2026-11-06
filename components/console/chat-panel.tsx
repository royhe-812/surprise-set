'use client'

import { Search, Settings } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { HOST } from '@/lib/break/data'
import { formatTime } from '@/lib/break/selectors'
import { useBreak } from '@/components/break/break-provider'
import { Switch } from '@/components/break/primitives'
import { cn } from '@/lib/utils'

const TABS = ['Chat', 'Activity', 'Tools'] as const
const FILTERS = ['All', 'Questions', 'Bookmarked', 'Users', 'Following']

export function ChatPanel() {
  const { state, dispatch } = useBreak()
  const [tab, setTab] = useState<(typeof TABS)[number]>('Chat')
  const [filter, setFilter] = useState('All')
  const endRef = useRef<HTMLDivElement>(null)
  const scrollerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = scrollerRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [state.chat.length, tab])

  const messages = state.chat.filter((m) => {
    if (filter === 'Questions') return m.text?.includes('?')
    if (filter === 'Users') return m.kind === 'user' || m.kind === 'join'
    if (filter === 'Bookmarked') return false
    if (filter === 'Following') return m.kind === 'follow'
    return true
  })
  const activity = state.chat.filter((m) => m.kind === 'seller' || m.kind === 'system')
  const allAuto = state.listings.every((l) => l.phase === 'sold' || l.autoRandomize)

  return (
    <section aria-label="Chat" className="flex h-[820px] min-w-0 flex-1 flex-col rounded-t-xl bg-white shadow-eb-card">
      <div role="tablist" aria-label="Stream tools" className="flex gap-10 px-4 pt-5">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            role="tab"
            id={`tab-${t}`}
            aria-selected={tab === t}
            aria-controls="stream-tabpanel"
            onClick={() => setTab(t)}
            className={cn(
              'relative border-b-2 pb-2 text-lg',
              tab === t ? 'border-eb-ink font-bold text-eb-ink' : 'border-transparent text-eb-grey',
            )}
          >
            {t}
            {t === 'Activity' && (
              <span className="absolute -top-2 -right-4 grid size-5 place-items-center rounded-full bg-eb-red text-[11px] font-bold text-white">
                9
              </span>
            )}
          </button>
        ))}
      </div>

      <div id="stream-tabpanel" role="tabpanel" aria-labelledby={`tab-${tab}`} className="flex min-h-0 flex-1 flex-col">
        {tab === 'Chat' && (
          <>
            <div className="flex items-center gap-2 px-4 py-4">
              <div className="flex min-w-0 flex-1 gap-2 overflow-hidden">
                {FILTERS.map((f) => (
                  <button
                    key={f}
                    type="button"
                    aria-pressed={filter === f}
                    onClick={() => setFilter(f)}
                    className={cn(
                      'h-9 shrink-0 rounded-full border px-4 text-base',
                      filter === f ? 'border-eb-ink bg-eb-ink font-bold text-white' : 'border-eb-grey bg-white text-eb-ink',
                    )}
                  >
                    {f}
                  </button>
                ))}
              </div>
              <button type="button" aria-label="Chat settings" className="grid size-9 shrink-0 place-items-center rounded-full border border-eb-grey">
                <Settings className="size-4" />
              </button>
              <button type="button" aria-label="Search chat" className="grid size-9 shrink-0 place-items-center rounded-full border border-eb-grey">
                <Search className="size-4" />
              </button>
            </div>

            <div ref={scrollerRef} className="eb-scroll flex-1 overflow-y-auto px-4 pb-6">
              <ul className="space-y-5">
                {messages.map((m) => (
                  <li key={m.id} className="text-base leading-6">
                    {m.kind === 'follow' || m.kind === 'join' ? (
                      <p className={m.kind === 'follow' ? 'text-eb-grey' : 'text-eb-ink'}>
                        <b className={cn('font-bold', m.kind === 'follow' ? 'text-eb-grey' : 'text-eb-ink')}>{m.user}</b>{' '}
                        {m.kind === 'follow' ? 'started following you' : 'joined'}{' '}
                        <span className="text-eb-grey">
                          · {formatTime(m.atMin)}
                        </span>
                      </p>
                    ) : (
                      <>
                        <p>
                          <b className={cn('font-bold', m.user === HOST ? 'text-eb-blue' : 'text-eb-ink')}>{m.user}</b>{' '}
                          <span className="text-eb-grey">· {formatTime(m.atMin)}</span>
                        </p>
                        <p className="text-eb-ink">{m.text ?? ''}</p>
                      </>
                    )}
                  </li>
                ))}
              </ul>
              <div ref={endRef} />
            </div>
          </>
        )}

        {tab === 'Activity' && (
          <ul className="eb-scroll flex-1 space-y-4 overflow-y-auto px-4 py-5">
            {activity.length === 0 && <li className="text-sm text-eb-grey">No activity yet.</li>}
            {[...activity].reverse().map((m) => (
              <li key={m.id} className="border-b border-eb-line pb-3 text-sm">
                <p className="text-xs text-eb-grey">{formatTime(m.atMin)}</p>
                <p>{m.text}</p>
              </li>
            ))}
          </ul>
        )}

        {tab === 'Tools' && (
          <div className="flex-1 px-4 py-5">
            <button
              type="button"
              role="switch"
              aria-checked={allAuto}
              onClick={() => dispatch({ type: 'SET_AUTO_ALL', value: !allAuto })}
              className="flex w-full items-center justify-between rounded-lg border border-eb-line p-4 text-left"
            >
              <span>
                <span className="block text-base font-bold">Auto-randomize all</span>
                <span className="block text-sm text-eb-grey">Assign a random spot as soon as each listing is paid for.</span>
              </span>
              <Switch checked={allAuto} />
            </button>
          </div>
        )}
      </div>
    </section>
  )
}
