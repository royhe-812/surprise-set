'use client'

import { ChevronDown, Plus, Search, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import { formatPrice, formatTime, pad3 } from '@/lib/break/selectors'
import type { SpotFilter } from '@/lib/break/types'
import { cn } from '@/lib/utils'
import { useBreak } from './break-provider'
import { Eyebrow, IconButton, Menu, MenuItem } from './primitives'

function AddSpot() {
  const { dispatch } = useBreak()
  const [name, setName] = useState('')
  return (
    <Menu
      role="dialog"
      label="Add a spot"
      width={264}
      trigger={({ open, toggle }) => (
        <IconButton label="Add a spot" aria-haspopup="dialog" aria-expanded={open} onClick={toggle}>
          <Plus className="size-5" />
        </IconButton>
      )}
    >
      {(close) => (
        <form
          className="flex flex-col gap-2 p-1"
          onSubmit={(e) => {
            e.preventDefault()
            dispatch({ type: 'ADD_SPOT', name })
            setName('')
            close()
          }}
        >
          <label className="text-sm font-bold" htmlFor="add-spot">
            Add a spot
          </label>
          <input
            id="add-spot"
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Free agents"
            className="h-10 rounded-lg border border-eb-grey px-3 text-sm outline-none focus-visible:border-eb-blue"
          />
          <button
            type="submit"
            disabled={!name.trim()}
            className="h-10 rounded-full bg-eb-blue text-sm font-bold text-white disabled:bg-eb-mid"
          >
            Add spot
          </button>
        </form>
      )}
    </Menu>
  )
}

export function SpotsSection() {
  const { state, dispatch, summary } = useBreak()
  const [query, setQuery] = useState('')
  const [searching, setSearching] = useState(false)
  const { assignedMap, assignedCount, total, left, allAssigned } = summary
  const phase = state.breakPhase

  const currentListing = state.listings[state.index]
  const canPickHere = currentListing.phase === 'sold' && !!currentListing.sale?.paid

  const showFilter = assignedCount >= 1 && !allAssigned
  const filter: SpotFilter = allAssigned ? 'assigned' : assignedCount === 0 ? 'available' : state.filter

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase()
    return state.spots.filter((spot) => {
      const isAssigned = assignedMap.has(spot)
      if (filter === 'available' && isAssigned) return false
      if (filter === 'assigned' && !isAssigned) return false
      return !q || spot.toLowerCase().includes(q)
    })
  }, [state.spots, assignedMap, filter, query])

  const filterLabel: Record<SpotFilter, string> = {
    available: `Available (${left})`,
    assigned: `Assigned (${assignedCount})`,
    all: `All (${total})`,
  }

  return (
    <section aria-label="Spots in break" className="px-4 pb-4">
      <div className="flex items-center gap-2 pt-1 pb-1">
        <div className="min-w-0 flex-1">
          <h2 className="text-base leading-5 font-bold text-eb-ink">Spots in break ({total})</h2>
          <Eyebrow>{allAssigned ? 'All spots assigned' : `${left} left to assign`}</Eyebrow>
        </div>

        {showFilter && (
          <Menu
            label="Filter spots"
            width={200}
            trigger={({ open, toggle }) => (
              <button
                type="button"
                aria-haspopup="menu"
                aria-expanded={open}
                onClick={toggle}
                className="inline-flex h-8 items-center gap-2 rounded-full border border-eb-grey bg-white px-4 text-sm text-eb-ink"
              >
                {filterLabel[filter]}
                <ChevronDown className="size-4" aria-hidden />
              </button>
            )}
          >
            {(close) => (
              <>
                {(['available', 'assigned', 'all'] as const).map((value) => (
                  <MenuItem
                    key={value}
                    aria-current={filter === value}
                    className={cn(filter === value && 'font-bold')}
                    onClick={() => {
                      dispatch({ type: 'SET_FILTER', value })
                      close()
                    }}
                  >
                    {filterLabel[value]}
                  </MenuItem>
                ))}
              </>
            )}
          </Menu>
        )}

        {phase === 'idle' && !allAssigned && <AddSpot />}
        <IconButton
          label={searching ? 'Close search' : 'Search spots'}
          aria-pressed={searching}
          onClick={() => {
            setSearching((s) => !s)
            setQuery('')
          }}
        >
          {searching ? <X className="size-5" /> : <Search className="size-5" />}
        </IconButton>
      </div>

      {searching && (
        <input
          autoFocus
          aria-label="Search spots"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search spots"
          className="mt-2 h-10 w-full rounded-full border border-eb-grey px-4 text-sm outline-none focus-visible:border-eb-blue"
        />
      )}

      <ul className="mt-1">
        {rows.map((spot) => {
          const a = assignedMap.get(spot)
          return (
            <li key={spot} className="flex items-center justify-between gap-3 border-b border-eb-line py-2">
              {a ? (
                <>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs leading-4 text-eb-green">{spot}</p>
                    <p className="truncate text-xs leading-4 text-eb-grey">
                      #{pad3(a.listingId)} • {a.buyer}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs leading-4 font-bold text-eb-ink">{formatPrice(a.price)}</p>
                    <p className="text-[10px] leading-4 text-eb-grey uppercase">{formatTime(a.atMin)}</p>
                  </div>
                </>
              ) : (
                <p className="min-w-0 flex-1 truncate py-2 text-sm text-eb-grey">{spot}</p>
              )}
              <Menu label={`Options for ${spot}`} width={232}>
                {(close) =>
                  a ? (
                    <MenuItem
                      danger
                      onClick={() => {
                        dispatch({ type: 'REMOVE_ASSIGNMENT', id: a.listingId, spot })
                        close()
                      }}
                    >
                      Remove assignment
                    </MenuItem>
                  ) : (
                    <>
                      <MenuItem
                        disabled={!canPickHere}
                        onClick={() => {
                          dispatch({ type: 'PICK', id: currentListing.id, spot })
                          close()
                        }}
                      >
                        {canPickHere ? `Assign to #${pad3(currentListing.id)}` : 'Assign to current listing'}
                      </MenuItem>
                      <MenuItem
                        danger
                        onClick={() => {
                          dispatch({ type: 'REMOVE_SPOT', name: spot })
                          close()
                        }}
                      >
                        Remove spot
                      </MenuItem>
                    </>
                  )
                }
              </Menu>
            </li>
          )
        })}
        {rows.length === 0 && (
          <li className="py-6 text-center text-sm text-eb-grey">
            {query ? `No spots match “${query}”.` : filter === 'available' ? 'No spots left to assign.' : 'No spots assigned yet.'}
          </li>
        )}
      </ul>
    </section>
  )
}
