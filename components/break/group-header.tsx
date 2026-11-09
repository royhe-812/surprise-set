'use client'

import { Gift, List, Pencil, Pin, Trash2, Video } from 'lucide-react'
import Image from 'next/image'
import { BREAK_NUMBER, BREAK_TITLE } from '@/lib/break/data'
import { formatPrice } from '@/lib/break/selectors'
import { cn } from '@/lib/utils'
import { useBreak } from './break-provider'
import { Menu, MenuItem, MenuSwitchItem } from './primitives'

function StatusPill({ tone, children }: { tone: 'green' | 'grey'; children: string }) {
  return (
    <span
      className={cn(
        'shrink-0 rounded-full border px-2 py-px text-[10px] leading-4 font-bold tracking-[0.5px] uppercase',
        tone === 'green' ? 'border-eb-green text-eb-green' : 'border-eb-grey text-eb-grey',
      )}
    >
      {children}
    </span>
  )
}

export function GroupHeader() {
  const { state, dispatch, summary } = useBreak()
  const { assignedCount, total, allAssigned, subtotal, listingsVisible } = summary
  const phase = state.breakPhase
  const progress = total ? (assignedCount / total) * 100 : 0
  const autoAll = state.listings.every((l) => l.phase === 'sold' || l.autoRandomize)

  const showStart = phase === 'idle' && assignedCount >= 1
  const pill =
    phase === 'breaking' ? (
      <StatusPill tone="green">Breaking now</StatusPill>
    ) : phase === 'done' ? (
      <StatusPill tone="grey">Break closed</StatusPill>
    ) : allAssigned ? (
      <StatusPill tone="green">Sold</StatusPill>
    ) : null

  return (
    <section aria-label="Surprise set group" className="flex gap-4 border-b border-eb-line px-4 pt-4 pb-2">
      <div className="relative size-24 shrink-0 overflow-hidden rounded-2xl bg-black/20">
        <Image
          src="/figma/surprise-watch.png"
          alt="Luxury wristwatch with a blue dial"
          width={1024}
          height={768}
          className="size-full object-cover"
        />
        <span aria-hidden className="absolute top-2 left-2 size-[18px] rounded-[5px] border border-eb-mid bg-white" />
        <span className="absolute bottom-2 left-2 rounded-lg bg-eb-violet px-2 py-1 text-[10px] leading-3 font-bold tracking-[0.5px] text-white uppercase">
          Surprise set
        </span>
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-8 items-center rounded-full border border-eb-line px-4 text-base text-eb-grey">
            <span aria-hidden className="mr-1.5 text-eb-grey">
              #
            </span>
            <span className="sr-only">Break number </span>
            {BREAK_NUMBER}
          </span>
          <span className="flex-1" />

          {showStart && (
            <button
              type="button"
              onClick={() => dispatch({ type: 'SET_BREAK_PHASE', value: 'breaking' })}
              className="h-8 rounded-full bg-eb-blue px-4 text-sm font-bold text-white hover:bg-[#0654c4]"
            >
              Start breaking
            </button>
          )}
          {phase === 'breaking' && (
            <button
              type="button"
              onClick={() => dispatch({ type: 'SET_BREAK_PHASE', value: 'done' })}
              className="h-8 rounded-full bg-eb-blue px-4 text-sm font-bold text-white hover:bg-[#0654c4]"
            >
              Done breaking
            </button>
          )}

          <button
            type="button"
            aria-label={state.pinned ? 'Unpin break from stream' : 'Pin break to stream'}
            aria-pressed={state.pinned}
            onClick={() => dispatch({ type: 'SET_PINNED', value: !state.pinned })}
            className={cn(
              'inline-flex size-8 shrink-0 items-center justify-center rounded-full',
              state.pinned ? 'bg-eb-ink text-white' : 'border border-eb-grey bg-white text-eb-ink',
            )}
          >
            <Pin className="size-4" fill={state.pinned ? 'currentColor' : 'none'} />
          </button>

          <Menu label="Break options" width={256}>
            {(close) => (
              <>
                {assignedCount === 0 && (
                  <MenuItem icon={<Pencil className="size-4" />} onClick={close}>
                    Edit
                  </MenuItem>
                )}
                {phase === 'idle' && assignedCount >= 1 && (
                  <MenuItem
                    icon={<Video className="size-4" />}
                    onClick={() => {
                      dispatch({ type: 'SET_BREAK_PHASE', value: 'breaking' })
                      close()
                    }}
                  >
                    Start breaking
                  </MenuItem>
                )}
                {phase === 'breaking' && (
                  <MenuItem
                    icon={<Video className="size-4" />}
                    onClick={() => {
                      dispatch({ type: 'SET_BREAK_PHASE', value: 'idle' })
                      close()
                    }}
                  >
                    Stop breaking
                  </MenuItem>
                )}
                {!allAssigned && phase === 'idle' && (
                  <MenuSwitchItem
                    icon={<Gift className="size-4" />}
                    label="Auto-randomize all"
                    checked={autoAll}
                    onChange={(value) => dispatch({ type: 'SET_AUTO_ALL', value })}
                  />
                )}
                {(allAssigned || phase !== 'idle') && (
                  <MenuSwitchItem
                    icon={<List className="size-4" />}
                    label="Show listings"
                    checked={listingsVisible}
                    onChange={(value) => dispatch({ type: 'SET_SHOW_LISTINGS', value })}
                  />
                )}
                {assignedCount === 0 && (
                  <MenuItem danger icon={<Trash2 className="size-4" />} onClick={close}>
                    Remove from event
                  </MenuItem>
                )}
              </>
            )}
          </Menu>
        </div>

        <div className="flex items-center gap-2">
          <p className="min-w-0 flex-1 truncate text-sm leading-5 text-eb-ink">{BREAK_TITLE}</p>
          {pill}
        </div>

        <div
          role="progressbar"
          aria-label="Spots assigned"
          aria-valuemin={0}
          aria-valuemax={total}
          aria-valuenow={assignedCount}
          className="h-1 overflow-hidden rounded-full bg-eb-line"
        >
          <div className="h-full rounded-full bg-eb-blue transition-[width] duration-500" style={{ width: `${progress}%` }} />
        </div>

        <div className="flex items-baseline justify-between text-base">
          <span className="font-bold text-eb-ink">{allAssigned ? `Subtotal: ${formatPrice(subtotal)}` : '$0.99'}</span>
          <span className="text-eb-grey">
            {assignedCount}/{total} spots assigned
          </span>
        </div>
      </div>
    </section>
  )
}
