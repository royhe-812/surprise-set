import type { BreakState, Listing, SpotAssignment } from './types'

export function formatPrice(n: number): string {
  if (n >= 10) return `$${Math.round(n).toLocaleString('en-US')}`
  return `$${n.toFixed(2)}`
}

export function formatTime(min: number): string {
  const total = 12 * 60 + min
  const h24 = Math.floor(total / 60)
  const m = total % 60
  const h = ((h24 - 1) % 12) + 1
  return `${h}:${String(m).padStart(2, '0')}pm`
}

export function pad3(n: number): string {
  return String(n).padStart(3, '0')
}

export function takenSpots(s: BreakState): Set<string> {
  const set = new Set<string>()
  for (const l of s.listings) for (const r of l.results) set.add(r.spot)
  return set
}

export function assignedSpotSet(s: BreakState): Set<string> {
  const set = new Set<string>()
  for (const l of s.listings) for (const r of l.results) if (r.assigned) set.add(r.spot)
  return set
}

export function assignmentMap(s: BreakState): Map<string, SpotAssignment> {
  const map = new Map<string, SpotAssignment>()
  for (const l of s.listings) {
    if (!l.sale) continue
    const count = l.results.filter((r) => r.assigned).length || 1
    for (const r of l.results) {
      if (!r.assigned) continue
      map.set(r.spot, {
        spot: r.spot,
        listingId: l.id,
        buyer: l.sale.buyer,
        price: l.sale.price / count,
        atMin: l.sale.atMin,
      })
    }
  }
  return map
}

export function assignedSpots(l: Listing): string[] {
  return l.results.filter((r) => r.assigned).map((r) => r.spot)
}

export function groupSummary(s: BreakState) {
  const assigned = assignmentMap(s)
  const total = s.spots.length
  const allAssigned = total > 0 && assigned.size >= total
  const sold = s.listings.filter((l) => l.phase === 'sold')
  const subtotal = sold.reduce((sum, l) => sum + (l.sale?.price ?? 0), 0)
  const listingsVisible = s.showListings ?? !allAssigned
  return {
    assignedMap: assigned,
    assignedCount: assigned.size,
    total,
    left: total - assigned.size,
    allAssigned,
    soldCount: sold.length,
    subtotal,
    listingsVisible,
  }
}
