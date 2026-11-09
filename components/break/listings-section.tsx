'use client'

import { ChevronLeft, ChevronRight, ChevronDown, Zap } from 'lucide-react'
import { useEffect, useState } from 'react'
import { formatPrice } from '@/lib/break/selectors'
import type { Listing } from '@/lib/break/types'
import { useBreak } from './break-provider'
import { Eyebrow } from './primitives'
import { ListingCard } from './listing-card'

function FlashDealForm({ listing, onClose }: { listing: Listing; onClose: () => void }) {
  const { dispatch } = useBreak()
  const [dollars, setDollars] = useState('50')
  const [minutes, setMinutes] = useState('5')
  const amount = Number(dollars)
  const valid = Number.isFinite(amount) && amount > 0 && amount < listing.binPrice

  return (
    <form
      aria-label="Flash deal"
      className="flex min-w-0 flex-1 flex-col gap-3 rounded-lg border border-eb-line bg-white p-3"
      onSubmit={(e) => {
        e.preventDefault()
        if (!valid) return
        dispatch({
          type: 'START_FLASH',
          id: listing.id,
          pct: Math.round((amount / listing.binPrice) * 100),
          seconds: Number(minutes) * 60,
        })
        onClose()
      }}
    >
      <p className="text-base font-bold">{formatPrice(listing.binPrice)}</p>
      <div className="grid grid-cols-2 gap-3">
        <label className="flex flex-col gap-1 text-sm">
          Type
          <span className="flex h-10 items-center justify-between rounded-lg border border-eb-grey bg-eb-surface px-3 text-sm">
            Amount off <ChevronDown className="size-4" aria-hidden />
          </span>
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Dollars off
          <span className="flex h-10 items-center gap-1 rounded-lg border border-eb-grey bg-eb-surface px-3">
            $
            <input
              inputMode="numeric"
              value={dollars}
              onChange={(e) => setDollars(e.target.value.replace(/[^0-9.]/g, ''))}
              aria-invalid={!valid}
              className="w-full bg-transparent text-sm outline-none"
            />
          </span>
        </label>
      </div>
      <label className="flex flex-col gap-1 text-sm">
        Set duration
        <select
          value={minutes}
          onChange={(e) => setMinutes(e.target.value)}
          className="h-10 rounded-lg border border-eb-grey bg-eb-surface px-3 text-sm"
        >
          <option value="1">1 minute</option>
          <option value="5">5 minutes</option>
          <option value="10">10 minutes</option>
        </select>
      </label>
      {!valid && <p className="text-xs text-eb-red">Enter a discount under {formatPrice(listing.binPrice)}.</p>}
      <div className="flex gap-2">
        <button type="button" onClick={onClose} className="h-10 flex-1 rounded-full border border-eb-grey bg-white text-sm">
          Cancel
        </button>
        <button
          type="submit"
          disabled={!valid}
          className="h-10 flex-[1.2] rounded-full bg-eb-blue text-sm font-bold text-white disabled:bg-eb-mid"
        >
          Start flash deal
        </button>
      </div>
    </form>
  )
}

export function ListingsSection() {
  const { state, dispatch, summary } = useBreak()
  const listing = state.listings[state.index]
  const [flashFor, setFlashFor] = useState<number | null>(null)

  useEffect(() => {
    const onFlash = (e: Event) => setFlashFor((e as CustomEvent<number>).detail)
    window.addEventListener('flash-deal', onFlash)
    return () => window.removeEventListener('flash-deal', onFlash)
  }, [])

  const showFlash = flashFor === listing.id

  return (
    <section aria-label="Listings" className="px-4 pt-3 pb-4">
      <div className="flex flex-col pb-2">
        <h2 className="text-sm leading-5 font-bold text-eb-ink">Listings ({state.listings.length})</h2>
        {summary.soldCount > 0 && (
          <p className="flex items-center gap-2">
            <Eyebrow>{summary.soldCount} sold</Eyebrow>
            <span aria-hidden className="size-1 rounded-full bg-eb-mid" />
            <Eyebrow>Subtotal: {formatPrice(summary.subtotal)}</Eyebrow>
          </p>
        )}
      </div>

      <div className="flex items-center gap-1">
        <button
          type="button"
          aria-label="Previous listing"
          disabled={state.index === 0}
          onClick={() => dispatch({ type: 'NAV', index: state.index - 1 })}
          className="flex h-24 w-5 shrink-0 items-center justify-center text-eb-ink disabled:text-eb-mid"
        >
          <ChevronLeft className="size-5" />
        </button>

        {showFlash ? (
          <FlashDealForm listing={listing} onClose={() => setFlashFor(null)} />
        ) : (
          <ListingCard key={listing.id} listing={listing} />
        )}

        <button
          type="button"
          aria-label="Next listing"
          disabled={state.index === state.listings.length - 1}
          onClick={() => dispatch({ type: 'NAV', index: state.index + 1 })}
          className="flex h-24 w-5 shrink-0 items-center justify-center text-eb-ink disabled:text-eb-mid"
        >
          <ChevronRight className="size-5" />
        </button>
      </div>
      <p className="sr-only" aria-live="polite">
        {listing.format === 'bin' ? <Zap aria-hidden /> : null}
        Showing listing {listing.id} of {state.listings.length}
      </p>
    </section>
  )
}
