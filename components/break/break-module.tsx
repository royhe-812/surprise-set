'use client'

import { ChevronLeft, Search, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { pad3, takenSpots } from '@/lib/break/selectors'
import { useBreak } from './break-provider'
import { GroupHeader } from './group-header'
import { ListingsSection } from './listings-section'
import { SpotsSection } from './spots-section'

function PickSpotSheet({ listingId, onClose }: { listingId: number; onClose: () => void }) {
  const { state, dispatch } = useBreak()
  const [query, setQuery] = useState('')
  const taken = takenSpots(state)
  const options = state.spots.filter(
    (spot) => !taken.has(spot) && spot.toLowerCase().includes(query.trim().toLowerCase()),
  )

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="absolute inset-0 z-50 flex items-end bg-black/40" onMouseDown={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Pick a spot for listing ${pad3(listingId)}`}
        onMouseDown={(e) => e.stopPropagation()}
        className="eb-pop flex max-h-[75%] w-full flex-col rounded-t-2xl bg-white"
      >
        <div className="flex items-center justify-between px-4 pt-4 pb-2">
          <h2 className="text-base font-bold">Pick a spot for #{pad3(listingId)}</h2>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="inline-flex size-8 items-center justify-center rounded-full bg-eb-surface"
          >
            <X className="size-4" />
          </button>
        </div>
        <label className="mx-4 mb-2 flex h-10 items-center gap-2 rounded-full border border-eb-grey px-4">
          <Search className="size-4 text-eb-grey" aria-hidden />
          <input
            autoFocus
            aria-label="Search available spots"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search available spots"
            className="w-full text-sm outline-none"
          />
        </label>
        <ul className="eb-scroll flex-1 overflow-y-auto px-4 pb-4">
          {options.map((spot) => (
            <li key={spot}>
              <button
                type="button"
                onClick={() => {
                  dispatch({ type: 'PICK', id: listingId, spot })
                  onClose()
                }}
                className="flex h-12 w-full items-center border-b border-eb-line text-left text-sm hover:bg-eb-surface"
              >
                {spot}
              </button>
            </li>
          ))}
          {options.length === 0 && <li className="py-6 text-center text-sm text-eb-grey">No available spots.</li>}
        </ul>
      </div>
    </div>
  )
}

export function BreakModule() {
  const { summary } = useBreak()
  const [pickFor, setPickFor] = useState<number | null>(null)

  return (
    <section
      aria-label="Case break"
      className="relative flex h-[820px] w-[494px] shrink-0 flex-col overflow-hidden rounded-t-xl bg-white shadow-eb-card"
    >
      <header className="flex h-16 shrink-0 items-center gap-4 border-b border-eb-line px-4 pt-4 pb-3">
        <button
          type="button"
          aria-label="Back to listings"
          className="inline-flex size-8 items-center justify-center rounded-full bg-eb-surface hover:bg-eb-line"
        >
          <ChevronLeft className="size-5" />
        </button>
        <h1 className="text-lg font-bold">Case break</h1>
      </header>

      <div className="eb-scroll min-h-0 flex-1 overflow-y-auto">
        <GroupHeader />
        {summary.listingsVisible && <ListingsSection onPick={setPickFor} />}
        <SpotsSection />
      </div>

      {pickFor !== null && <PickSpotSheet listingId={pickFor} onClose={() => setPickFor(null)} />}
    </section>
  )
}
