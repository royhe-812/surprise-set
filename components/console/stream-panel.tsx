'use client'

import { ChevronDown, ChevronRight, CircleHelp, Ellipsis, Heart, LayoutGrid, Radio, Wallet, ChartNoAxesColumn } from 'lucide-react'
import { HOST } from '@/lib/break/data'
import { formatPrice, pad3 } from '@/lib/break/selectors'
import { useBreak } from '@/components/break/break-provider'
import { cn } from '@/lib/utils'

const RAIL = [
  { label: 'Items', icon: LayoutGrid },
  { label: 'Wallet', icon: Wallet },
  { label: 'Polls', icon: ChartNoAxesColumn },
  { label: 'More', icon: Ellipsis },
] as const

export function StreamPanel() {
  const { state } = useBreak()
  const listing = state.listings[state.index]
  const live = listing.phase === 'live' && listing.live
  const sold = listing.phase === 'sold'

  const price = sold ? listing.sale!.price : live ? listing.live!.bid || listing.startPrice : listing.format === 'bin' ? listing.binPrice : listing.startPrice
  const cta = sold ? 'Sold' : live ? `Bid ${formatPrice((listing.live!.bid || 0) + 1)}` : listing.format === 'bin' && listing.purchasable ? 'Buy it now' : 'Starting soon'
  const ctaActive = !!live || (listing.format === 'bin' && listing.purchasable && listing.phase === 'unsold')

  return (
    <section aria-label="Streaming" className="w-[321px] shrink-0 rounded-t-xl bg-white p-4 shadow-eb-card">
      <h2 className="flex items-center gap-2 pt-1 pb-3 text-lg font-bold">
        Streaming <CircleHelp className="size-5" aria-label="About streaming" />
      </h2>

      <div className="relative h-[570px] w-[288px] overflow-hidden rounded-3xl bg-black text-white">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/stream-frame.png" alt="Live video preview of the host showing a card box" className="absolute inset-0 size-full object-cover" />
        <div aria-hidden className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/20 to-black/80" />

        <div className="absolute top-3 left-3 flex items-center gap-2">
          <span className="grid size-6 place-items-center rounded-full bg-black/40">
            <ChevronDown className="size-4" aria-hidden />
          </span>
          <span className="flex h-6 items-center gap-1.5 rounded-full bg-black/40 pr-2 pl-1 text-[11px] font-bold">
            <span className="grid size-4 place-items-center rounded-full bg-white/80 text-[8px] text-black">rr</span>
            {HOST}
            <Heart className="size-3" aria-hidden />
          </span>
        </div>

        <ul className="absolute top-3 right-2 flex w-8 flex-col items-center gap-3 rounded-full bg-black/40 py-2 text-[9px]">
          <li className="flex flex-col items-center gap-0.5">
            <span className="grid size-6 place-items-center rounded-full bg-[#4ce160] text-black">
              <Radio className="size-3.5" aria-hidden />
            </span>
            240
          </li>
          {RAIL.map(({ label, icon: Icon }) => (
            <li key={label} className="flex flex-col items-center gap-0.5 text-white/90">
              <Icon className="size-3.5" aria-hidden />
              {label}
            </li>
          ))}
        </ul>

        <div className="absolute inset-x-3 bottom-3 flex flex-col gap-2">
          <div className="space-y-2 pb-1 text-[11px] leading-4">
            <p className="text-white/60">
              redzonejunkie
              <br />
              <span className="text-white/60">Gotta try to win this one! Love it!</span>
            </p>
            <p>
              <b>philly.eagles332</b>
              <br />
              These are so hot, get your bids in!
            </p>
            <p>
              <b>broncos_brad</b>
              <br />
              So sick
            </p>
          </div>

          <div className="flex h-9 items-center justify-between rounded-full border border-white/70 bg-black/30 px-4 text-xs">
            Add comment…
            <Heart className="size-4 fill-[#ff5c5c] text-[#ff5c5c]" aria-hidden />
          </div>

          <div className="rounded-2xl bg-black/65 p-3 backdrop-blur">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="line-clamp-2 text-xs leading-4">
                  {state.pinned ? `#${pad3(listing.id)} · ` : ''}
                  {listing.title}
                </p>
                <p className="mt-1 text-sm">
                  <b>{formatPrice(price)}</b> <span className="text-xs text-white/70">+ Free shipping</span>
                </p>
              </div>
              <ChevronRight className="mt-1 size-4 shrink-0" aria-hidden />
            </div>
            <button
              type="button"
              disabled={!ctaActive}
              className={cn(
                'mt-3 h-9 w-full rounded-full border-2 text-sm font-bold',
                ctaActive ? 'border-white bg-eb-blue text-white' : 'border-white/70 bg-white/25 text-white/80',
              )}
            >
              {cta}
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
