'use client'

import { FastForward } from 'lucide-react'
import { useBreak } from '@/components/break/break-provider'
import { cn } from '@/lib/utils'

function clock(totalSeconds: number) {
  const s = Math.max(0, Math.ceil(totalSeconds))
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}

export function SkipBar() {
  const { state, dispatch } = useBreak()
  const live = state.listings.find((l) => l.phase === 'live' && l.live)
  const enabled = Boolean(live)

  return (
    <div className="mx-auto flex h-10 min-w-[1280px] max-w-[1440px] items-center justify-end gap-3 pb-3">
      <p className="text-sm text-eb-grey" aria-live="polite">
        {live?.live
          ? `Auction #${String(live.id).padStart(3, '0')} ends in ${clock(live.live.remaining)}`
          : 'No auction running'}
      </p>
      <button
        type="button"
        disabled={!enabled}
        onClick={() => dispatch({ type: 'SKIP_TIMER' })}
        className={cn(
          'inline-flex h-9 items-center gap-2 rounded-full px-4 text-sm font-bold transition-colors',
          enabled
            ? 'bg-eb-ink text-white hover:bg-black'
            : 'cursor-not-allowed bg-eb-line text-eb-grey',
        )}
      >
        <FastForward className="size-4" aria-hidden />
        Skip
      </button>
    </div>
  )
}
