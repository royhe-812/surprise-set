'use client'

import { Check, Gavel, Search, Settings, Undo2 } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { HOST } from '@/lib/break/data'
import { formatPrice, formatTime, pad3 } from '@/lib/break/selectors'
import type { ActivityKind } from '@/lib/break/types'
import { useBreak } from '@/components/break/break-provider'
import { Switch } from '@/components/break/primitives'
import { cn } from '@/lib/utils'

const TABS = ['Chat', 'Activity', 'Tools'] as const
const ACTIVITY_ICON: Record<ActivityKind, typeof Check> = { won: Gavel, assigned: Check, unassigned: Undo2 }
const FILTERS = ['All', 'Questions', 'Bookmarked', 'Users', 'Following']

export function ChatPanel() {
  const { state, dispatch } = useBreak()
  const [tab, setTab] = useState<(typeof TABS)[number]>('Chat')
  const [filter, setFilter] = useState('All')
  const endRef = useRef<HTMLDivElement>(null)
  const scrollerRef = useRef<HTMLDivElement>(null)

  const [seen, setSeen] = useState(0)
  useEffect(() => {
    if (tab === 'Activity') setSeen(state.activity.length)
  }, [tab, state.activity.length])

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
  const activity = state.activity
  const unread = tab === 'Activity' ? 0 : Math.max(0, activity.length - seen)
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
            {t === 'Activity' && unread > 0 && (
              <span className="absolute -top-2 -right-4 grid min-w-5 place-items-center rounded-full bg-eb-red px-1 text-[11px] leading-5 font-bold text-white">
                <span aria-hidden>{unread > 99 ? '99+' : unread}</span>
                <span className="sr-only">{unread} new activity</span>
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
          <ul className="eb-scroll flex-1 overflow-y-auto px-4 py-2">
            {activity.length === 0 && <li className="py-3 text-sm text-eb-grey">No activity yet.</li>}
            {[...activity].reverse().map((a) => {
              const Icon = ACTIVITY_ICON[a.kind]
              return (
                <li key={a.id} className="flex items-start gap-3 border-b border-eb-line py-3">
                  <span
                    aria-hidden
                    className={cn(
                      'mt-0.5 grid size-8 shrink-0 place-items-center rounded-full',
                      a.kind === 'won' && 'bg-eb-surface text-eb-ink',
                      a.kind === 'assigned' && 'bg-[#e6f4ea] text-eb-green',
                      a.kind === 'unassigned' && 'bg-[#fdeaea] text-eb-red',
                    )}
                  >
                    <Icon className="size-4" />
                  </span>
                  <div className="min-w-0 flex-1 text-base leading-6">
                    <p className="text-eb-ink">
                      {a.kind === 'won' && (
                        <>
                          <b>{a.buyer}</b> won <b>#{pad3(a.listingId)}</b> for <b>{formatPrice(a.price ?? 0)}</b>
                        </>
                      )}
                      {a.kind === 'assigned' && (
                        <>
                          <b className="text-eb-green">{a.spot}</b> assigned to <b>{a.buyer}</b>
                          <span className="text-eb-grey"> · #{pad3(a.listingId)}</span>
                        </>
                      )}
                      {a.kind === 'unassigned' && (
                        <>
                          <b className="text-eb-red">{a.spot}</b> unassigned from <b>{a.buyer}</b>
                          <span className="text-eb-grey"> · #{pad3(a.listingId)}</span>
                        </>
                      )}
                    </p>
                    <p className="text-sm text-eb-grey">{formatTime(a.atMin)}</p>
                  </div>
                </li>
              )
            })}
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
