'use client'

import { Check, ChevronDown, ChevronRight, CircleX, Gift, Pencil, Skull, Trash2, Zap, ShoppingCart } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { AUCTION_SECONDS } from '@/lib/break/data'
import { assignedSpots, formatPrice, formatTime, pad3 } from '@/lib/break/selectors'
import type { Listing } from '@/lib/break/types'
import { cn } from '@/lib/utils'
import { useBreak } from './break-provider'
import { Eyebrow, Menu, MenuItem, MenuSwitchItem, Switch } from './primitives'

const outlineBtn =
  'inline-flex h-8 flex-1 items-center justify-center rounded-full border border-eb-blue bg-white px-4 text-sm text-eb-blue hover:bg-[#f2f7ff] disabled:border-eb-line disabled:text-eb-mid disabled:hover:bg-white'

function Notice({ children }: { children: ReactNode }) {
  return (
    <p className="flex items-start gap-2 text-xs leading-4 text-eb-ink" role="status">
      <CircleX aria-hidden className="mt-px size-4 shrink-0 fill-eb-red text-white" />
      <span>{children}</span>
    </p>
  )
}

function ResultRow({ listing, spot, assigned }: { listing: Listing; spot: string; assigned: boolean }) {
  const { dispatch } = useBreak()
  return (
    <div className="flex min-h-12 items-center justify-between gap-2 rounded-lg bg-white px-3 py-2">
      <span className={cn('truncate text-sm font-bold', assigned ? 'text-eb-green' : 'text-eb-ink')}>{spot}</span>
      {assigned ? (
        <button
          type="button"
          aria-label={`Unassign ${spot}`}
          onClick={() => dispatch({ type: 'UNASSIGN', id: listing.id, spot })}
          className="inline-flex h-8 shrink-0 items-center gap-1 rounded-full bg-eb-green px-4 text-sm font-bold text-white hover:bg-[#1f6a2b]"
        >
          <Check className="size-4" aria-hidden /> Assigned
        </button>
      ) : (
        <button
          type="button"
          onClick={() => dispatch({ type: 'ASSIGN', id: listing.id, spot })}
          className="inline-flex h-8 shrink-0 items-center gap-1 rounded-full bg-eb-blue px-4 text-sm font-bold text-white hover:bg-[#0654c4]"
        >
          <Check className="size-4" aria-hidden /> Assign
        </button>
      )}
    </div>
  )
}

function ListingMenu({ listing }: { listing: Listing }) {
  const { dispatch } = useBreak()
  const assigned = assignedSpots(listing)
  return (
    <Menu label={`Options for listing ${pad3(listing.id)}`} width={256}>
      {(close) => {
        if (listing.format === 'bin' && listing.phase === 'unsold') {
          return (
            <>
              <MenuSwitchItem
                icon={<ShoppingCart className="size-4" />}
                label="Purchasable"
                checked={listing.purchasable}
                onChange={(value) => dispatch({ type: 'SET_PURCHASABLE', id: listing.id, value })}
              />
              <MenuItem icon={<Pencil className="size-4" />} onClick={close}>
                Edit
              </MenuItem>
              <MenuItem
                icon={<Zap className="size-4" />}
                onClick={() => {
                  window.dispatchEvent(new CustomEvent('flash-deal', { detail: listing.id }))
                  close()
                }}
              >
                Flash deal
              </MenuItem>
              <MenuItem danger icon={<Trash2 className="size-4" />} onClick={close}>
                Remove from event
              </MenuItem>
            </>
          )
        }
        if (listing.phase === 'live') {
          return (
            <>
              <MenuSwitchItem
                icon={<Gift className="size-4" />}
                label="Auto-randomize all"
                checked={listing.autoRandomize}
                onChange={(value) => dispatch({ type: 'SET_AUTO', id: listing.id, value })}
              />
              <MenuItem
                danger
                icon={<CircleX className="size-4" />}
                onClick={() => {
                  dispatch({ type: 'END_AUCTION', id: listing.id })
                  close()
                }}
              >
                End auction
              </MenuItem>
            </>
          )
        }
        if (listing.phase === 'sold') {
          if (assigned.length === 0) return <p className="px-3 py-2 text-sm text-eb-grey">No assignments to remove</p>
          return (
            <MenuItem
              danger
              icon={<CircleX className="size-4" />}
              onClick={() => {
                dispatch({ type: 'REMOVE_ASSIGNMENT', id: listing.id })
                close()
              }}
            >
              {assigned.length > 1 ? 'Remove assignments' : 'Remove assignment'}
            </MenuItem>
          )
        }
        return (
          <>
            <MenuSwitchItem
              icon={<Skull className="size-4" />}
              label="Sudden death"
              checked={listing.suddenDeath}
              onChange={(value) => dispatch({ type: 'SET_SUDDEN_DEATH', id: listing.id, value })}
            />
            <MenuSwitchItem
              icon={<Gift className="size-4" />}
              label="Auto-randomize all"
              checked={listing.autoRandomize}
              onChange={(value) => dispatch({ type: 'SET_AUTO', id: listing.id, value })}
            />
            <MenuItem icon={<Pencil className="size-4" />} onClick={close}>
              Edit
            </MenuItem>
            <MenuItem danger icon={<Trash2 className="size-4" />} onClick={close}>
              Remove from event
            </MenuItem>
          </>
        )
      }}
    </Menu>
  )
}

export function ListingCard({ listing }: { listing: Listing }) {
  const { state, dispatch } = useBreak()
  const [showBuyer, setShowBuyer] = useState(false)
  const assigned = assignedSpots(listing)
  const pending = listing.results.filter((r) => !r.assigned)
  const spinning = listing.rand.status === 'spinning'
  const anotherLive = state.listings.some((l) => l.phase === 'live' && l.id !== listing.id)
  const paid = !!listing.sale?.paid
  const allPicked = listing.results.length > 0 && listing.results.every((r) => r.picked)
  const lastAuto = [...listing.results].reverse().find((r) => !r.picked)?.auto ?? false
  const flashPrice = listing.flash
    ? Math.round(listing.binPrice - (listing.binPrice * listing.flash.pct) / 100)
    : listing.binPrice

  const price =
    listing.phase === 'sold'
      ? listing.sale!.price
      : listing.phase === 'live'
        ? listing.live!.bid || listing.startPrice
        : listing.format === 'bin'
          ? flashPrice
          : listing.startPrice

  const showBody = listing.phase === 'sold'

  return (
    <article
      aria-label={`Listing ${pad3(listing.id)}`}
      className="flex min-w-0 flex-1 flex-col gap-3 rounded-lg border border-eb-line bg-white p-2"
    >
      <div className="flex items-center gap-4">
        <p className="min-w-0 flex-1 truncate text-sm leading-5">
          {assigned.length > 0 && <span className="text-eb-green">{assigned.join(', ')} </span>}
          <span className="text-eb-ink">#{pad3(listing.id)}</span>
          <span className="text-eb-grey"> - {listing.title}</span>
        </p>
        <ListingMenu listing={listing} />
      </div>

      <div className="flex items-end justify-between gap-2">
        <div className="min-w-0">
          <p className="flex items-baseline gap-2 text-base leading-5 font-bold text-eb-ink">
            {formatPrice(price)}
            {listing.format === 'bin' && listing.flash && (
              <span className="text-xs font-normal text-eb-grey line-through">{formatPrice(listing.binPrice)}</span>
            )}
            {listing.phase === 'live' && listing.live && listing.live.bids > 0 && (
              <span className="text-xs font-normal text-eb-grey">
                {listing.live.bids} {listing.live.bids === 1 ? 'bid' : 'bids'}
              </span>
            )}
          </p>
          {listing.phase === 'live' && listing.live && listing.live.leader && (
            <p className="text-xs text-eb-grey">{listing.live.leader} is winning</p>
          )}
          {listing.phase === 'sold' && listing.sale && (
            <button
              type="button"
              aria-expanded={showBuyer}
              onClick={() => setShowBuyer((v) => !v)}
              className="mt-0.5 inline-flex items-center gap-1 text-xs text-eb-grey"
            >
              {listing.sale.buyer} won
              <ChevronDown className={cn('size-3.5 transition-transform', showBuyer && 'rotate-180')} aria-hidden />
            </button>
          )}
        </div>

        {listing.format === 'auction' && listing.phase === 'unsold' && (
          <div className="flex items-center gap-3">
            {listing.suddenDeath && (
              <span className="inline-flex items-center gap-1.5 text-base text-eb-ink">
                <Skull className="size-5" aria-hidden />
                <span>
                  {AUCTION_SECONDS}s<span className="sr-only"> sudden death</span>
                </span>
              </span>
            )}
            <button
              type="button"
              disabled={anotherLive}
              onClick={() => dispatch({ type: 'START', id: listing.id })}
              className="inline-flex h-8 items-center rounded-full border border-eb-blue bg-white px-5 text-sm text-eb-blue hover:bg-[#f2f7ff] disabled:border-eb-line disabled:text-eb-mid"
            >
              Start
            </button>
          </div>
        )}

        {listing.format === 'auction' && listing.phase === 'live' && listing.live && (
          <p className="inline-flex items-center gap-2 text-base font-bold text-eb-red" aria-live="off">
            <span aria-hidden className="size-2 animate-pulse rounded-full bg-eb-red" />
            <span className="tabular-nums">0:{String(Math.max(0, Math.ceil(listing.live.remaining))).padStart(2, '0')}</span>
          </p>
        )}

        {listing.format === 'bin' && listing.phase === 'unsold' && (
          <div className="flex items-center gap-2">
            {listing.flash && (
              <span className="inline-flex h-6 items-center gap-1 rounded-md bg-eb-dark px-2 text-xs font-bold text-white">
                <Zap className="size-3" aria-hidden /> {listing.flash.pct}% off ·{' '}
                <span className="text-[#92c821] tabular-nums">
                  00:{String(Math.max(0, Math.ceil(listing.flash.remaining))).padStart(2, '0')}
                </span>
              </span>
            )}
            <button
              type="button"
              role="switch"
              aria-checked={listing.purchasable}
              onClick={() => dispatch({ type: 'SET_PURCHASABLE', id: listing.id, value: !listing.purchasable })}
              className="inline-flex items-center gap-2 text-sm text-eb-ink"
            >
              Purchasable <Switch checked={listing.purchasable} />
            </button>
          </div>
        )}

        {listing.phase === 'sold' && (
          <span
            className={cn(
              'inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-px text-[10px] leading-4 font-bold tracking-[0.5px] uppercase',
              paid ? 'border-eb-green text-eb-green' : 'border-eb-grey text-eb-grey',
            )}
          >
            {paid ? 'Paid' : 'Processing'}
            {paid && assigned.length > 0 && (
              <>
                <span aria-hidden className="size-1 rounded-full bg-current" />
                {assigned.length} assigned
              </>
            )}
          </span>
        )}
      </div>

      {listing.phase === 'sold' && showBuyer && listing.sale && (
        <p className="-mt-1 text-xs text-eb-grey">
          {listing.sale.buyer} won at {formatTime(listing.sale.atMin)} for {formatPrice(listing.sale.price)}
        </p>
      )}

      {listing.phase !== 'sold' && listing.autoRandomize && (
        <div className="rounded-lg bg-eb-surface px-3 py-2">
          <Eyebrow>Auto randomizing after payment</Eyebrow>
        </div>
      )}

      {showBody && listing.sale && (
        <>
          {!paid && listing.autoRandomize && (
            <div className="rounded-lg bg-eb-surface px-3 py-2">
              <Eyebrow>Auto randomizing after payment</Eyebrow>
            </div>
          )}

          {paid && (spinning || listing.results.length > 0 || listing.flagged) && (
            <div className="flex flex-col gap-2 rounded-lg bg-eb-surface p-2">
              {spinning && listing.results.length === 0 ? (
                <>
                  <Eyebrow>{listing.autoRandomize ? 'Auto randomizing' : 'Randomizing'}</Eyebrow>
                  <div aria-label="Randomizing" role="status" className="eb-shimmer h-12 rounded-lg" />
                </>
              ) : (
                <>
                  {listing.wiped ? (
                    <Notice>
                      Random results from prior spin not assigned. Listing needs spot assignment.
                    </Notice>
                  ) : listing.flagged ? (
                    <Notice>Listing needs spot assignment</Notice>
                  ) : (
                    listing.results.length > 0 && (
                      <Eyebrow>{allPicked ? 'Picked' : lastAuto ? 'Auto randomized' : 'Randomized'}</Eyebrow>
                    )
                  )}
                  {listing.results.map((r) => (
                    <ResultRow key={r.spot} listing={listing} spot={r.spot} assigned={r.assigned} />
                  ))}
                  {spinning && (
                    <div aria-label="Randomizing" role="status" className="eb-shimmer h-12 rounded-lg" />
                  )}
                </>
              )}
            </div>
          )}

          {paid && !(listing.autoRandomize && spinning && listing.results.length === 0) && (
            <div className="flex gap-2">
              <button
                type="button"
                disabled={spinning}
                onClick={() => dispatch({ type: 'RANDOMIZE', id: listing.id })}
                className={outlineBtn}
              >
                {listing.results.length > 0 ? 'Randomize another' : 'Randomize'}
              </button>
            </div>
          )}

          {paid && assigned.length > 0 && !spinning && (
            <button
              type="button"
              onClick={() => dispatch({ type: 'NEXT_LISTING' })}
              className="inline-flex h-10 w-full items-center justify-center gap-1 rounded-full bg-eb-blue text-sm font-bold text-white hover:bg-[#0654c4]"
            >
              Next listing <ChevronRight className="size-4" aria-hidden />
            </button>
          )}
        </>
      )}
    </article>
  )
}
