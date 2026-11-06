'use client'

import { SlidersHorizontal, X } from 'lucide-react'
import { useState } from 'react'
import { BIN_LISTING_ID } from '@/lib/break/data'
import { useBreak } from '@/components/break/break-provider'
import { cn } from '@/lib/utils'

const SCENARIOS = [
  { label: 'Unsold (0/32)', assigned: 0 },
  { label: 'Some assigned (4/32)', assigned: 4 },
  { label: 'Most assigned (28/32)', assigned: 28 },
  { label: 'All assigned (32/32)', assigned: 32 },
  { label: 'Breaking now', assigned: 32, breakPhase: 'breaking' as const },
  { label: 'Break closed', assigned: 32, breakPhase: 'done' as const },
]

export function PrototypeControls() {
  const { state, dispatch } = useBreak()
  const [open, setOpen] = useState(false)

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-expanded={false}
        className="fixed bottom-4 left-4 z-[60] inline-flex h-10 items-center gap-2 rounded-full bg-eb-ink px-4 text-sm font-bold text-white shadow-eb-float"
      >
        <SlidersHorizontal className="size-4" aria-hidden /> Prototype
      </button>
    )
  }

  return (
    <aside
      aria-label="Prototype controls"
      className="fixed bottom-4 left-4 z-[60] w-72 rounded-2xl bg-white p-4 text-sm shadow-eb-float"
    >
      <div className="flex items-center justify-between">
        <h2 className="font-bold">Prototype controls</h2>
        <button type="button" aria-label="Hide prototype controls" onClick={() => setOpen(false)}>
          <X className="size-4" />
        </button>
      </div>

      <p className="mt-3 text-xs font-bold tracking-[0.5px] text-eb-grey uppercase">Jump to break state</p>
      <div className="mt-2 grid grid-cols-1 gap-1.5">
        {SCENARIOS.map((s) => (
          <button
            key={s.label}
            type="button"
            onClick={() => dispatch({ type: 'SEED', assigned: s.assigned, breakPhase: s.breakPhase })}
            className="h-8 rounded-full border border-eb-line px-3 text-left hover:bg-eb-surface"
          >
            {s.label}
          </button>
        ))}
      </div>

      <p className="mt-3 text-xs font-bold tracking-[0.5px] text-eb-grey uppercase">Auction speed</p>
      <div className="mt-2 flex gap-1.5">
        {[1, 3, 6].map((v) => (
          <button
            key={v}
            type="button"
            aria-pressed={state.speed === v}
            onClick={() => dispatch({ type: 'SET_SPEED', value: v })}
            className={cn(
              'h-8 flex-1 rounded-full border text-sm',
              state.speed === v ? 'border-eb-ink bg-eb-ink font-bold text-white' : 'border-eb-line',
            )}
          >
            {v}x
          </button>
        ))}
      </div>

      <div className="mt-3 flex gap-1.5">
        <button
          type="button"
          onClick={() => {
            dispatch({ type: 'NAV', index: BIN_LISTING_ID - 1 })
          }}
          className="h-8 flex-1 rounded-full border border-eb-line hover:bg-eb-surface"
        >
          Go to BIN #006
        </button>
        <button
          type="button"
          onClick={() => dispatch({ type: 'BUY_BIN', id: BIN_LISTING_ID })}
          className="h-8 flex-1 rounded-full border border-eb-line hover:bg-eb-surface"
        >
          Buyer buys BIN
        </button>
      </div>

      <button
        type="button"
        onClick={() => dispatch({ type: 'RESET' })}
        className="mt-3 h-8 w-full rounded-full bg-eb-surface font-bold hover:bg-eb-line"
      >
        Reset
      </button>
    </aside>
  )
}
