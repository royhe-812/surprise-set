import {
  AUCTION_SECONDS,
  BIN_LISTING_ID,
  BREAK_NUMBER,
  BUYERS,
  HOST,
  LISTING_TITLE,
  TEAMS,
} from './data'
import type { ActivityKind, BreakPhase, BreakState, ChatKind, Listing, SpotFilter } from './types'
import { assignedSpotSet, formatPrice, takenSpots } from './selectors'

export type Action =
  | { type: 'TICK'; dt: number }
  | { type: 'START'; id: number }
  | { type: 'END_AUCTION'; id: number }
  | { type: 'SKIP_TIMER' }
  | { type: 'BUY_BIN'; id: number }
  | { type: 'RANDOMIZE'; id: number }
  | { type: 'ASSIGN'; id: number; spot: string }
  | { type: 'UNASSIGN'; id: number; spot: string }
  | { type: 'PICK'; id: number; spot: string }
  | { type: 'REMOVE_ASSIGNMENT'; id: number; spot?: string }
  | { type: 'NAV'; index: number }
  | { type: 'NEXT_LISTING' }
  | { type: 'SET_SUDDEN_DEATH'; id: number; value: boolean }
  | { type: 'SET_AUTO'; id: number; value: boolean }
  | { type: 'SET_AUTO_ALL'; value: boolean }
  | { type: 'SET_PURCHASABLE'; id: number; value: boolean }
  | { type: 'START_FLASH'; id: number; pct: number; seconds: number }
  | { type: 'SET_BREAK_PHASE'; value: BreakPhase }
  | { type: 'SET_SHOW_LISTINGS'; value: boolean }
  | { type: 'SET_FILTER'; value: SpotFilter }
  | { type: 'SET_PINNED'; value: boolean }
  | { type: 'ADD_SPOT'; name: string }
  | { type: 'REMOVE_SPOT'; name: string }
  | { type: 'SET_SPEED'; value: number }
  | { type: 'SEED'; assigned: number; breakPhase?: BreakPhase }
  | { type: 'RESET' }

const INITIAL_CHAT: BreakState['chat'] = [
  { id: 1, kind: 'follow', user: 'thriftedbyluna', atMin: 51 },
  { id: 2, kind: 'follow', user: 'secondchicfinds', atMin: 43 },
  { id: 3, kind: 'join', user: 'kayla.styles', atMin: 44 },
  { id: 4, kind: 'seller', user: HOST, text: 'Up next: #s 1, 8, 14, 21, 32, 33, 40', atMin: 45 },
  { id: 5, kind: 'join', user: 'ashley_marie89', atMin: 46 },
  { id: 6, kind: 'user', user: 'archivebyelle', text: 'Obsessed! So cute', atMin: 46 },
  { id: 7, kind: 'seller', user: HOST, text: 'Thanks for your purchase @secondchicfinds!', atMin: 48 },
  { id: 8, kind: 'user', user: 'madisons_closet', text: 'What is the length of the strap?', atMin: 49 },
]

function makeListing(id: number): Listing {
  const isBin = id === BIN_LISTING_ID
  return {
    id,
    title: LISTING_TITLE,
    format: isBin ? 'bin' : 'auction',
    startPrice: 0.99,
    binPrice: 1000,
    suddenDeath: true,
    autoRandomize: false,
    purchasable: true,
    flash: null,
    phase: 'unsold',
    live: null,
    sale: null,
    rand: { status: 'idle', spinIn: 0 },
    results: [],
    flagged: false,
    wiped: false,
  }
}

export function initialState(): BreakState {
  return {
    listings: Array.from({ length: 32 }, (_, i) => makeListing(i + 1)),
    spots: [...TEAMS],
    index: 0,
    breakPhase: 'idle',
    showListings: null,
    pinned: true,
    filter: 'available',
    seed: 20260611,
    clock: 52,
    speed: 1,
    chat: INITIAL_CHAT,
    chatId: 100,
    activity: [],
    activityId: 1,
  }
}

function rand(s: BreakState): number {
  s.seed = (s.seed + 0x6d2b79f5) | 0
  let t = s.seed
  t = Math.imul(t ^ (t >>> 15), t | 1)
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296
}

function pickOne<T>(s: BreakState, list: T[]): T {
  return list[Math.floor(rand(s) * list.length)]
}

function pushChat(s: BreakState, kind: ChatKind, user: string, text?: string) {
  s.chat = [...s.chat, { id: s.chatId++, kind, user, text, atMin: s.clock }]
}

function logActivity(
  s: BreakState,
  kind: ActivityKind,
  l: Listing,
  extra: { spot?: string; price?: number } = {},
) {
  if (!l.sale) return
  s.activity = [
    ...s.activity,
    { id: s.activityId++, kind, listingId: l.id, buyer: l.sale.buyer, atMin: s.clock, ...extra },
  ]
}

export function hasActive(s: BreakState): boolean {
  return s.listings.some(
    (l) =>
      l.phase === 'live' ||
      (l.phase === 'sold' && l.sale && !l.sale.paid) ||
      l.rand.status === 'spinning' ||
      l.flash,
  )
}

function wipeStaleResults(s: BreakState, soldId: number) {
  for (const l of s.listings) {
    if (l.id === soldId) continue
    if (l.flagged && l.results.some((r) => !r.assigned)) {
      l.results = l.results.filter((r) => r.assigned)
      l.rand = { status: l.results.length ? 'result' : 'idle', spinIn: 0 }
      l.wiped = true
    }
  }
}

function sell(s: BreakState, l: Listing, buyer: string, price: number) {
  s.clock += 1
  l.phase = 'sold'
  l.live = null
  l.flash = null
  l.sale = { buyer, price, atMin: s.clock, paid: false, paidIn: 1500 + rand(s) * 1500 }
  pushChat(s, 'seller', HOST, `Sold! #${String(l.id).padStart(3, '0')} to @${buyer} for ${formatPrice(price)}`)
  logActivity(s, 'won', l, { price })
  wipeStaleResults(s, l.id)
}

function startSpin(l: Listing) {
  l.rand = { status: 'spinning', spinIn: 1600 }
}

function finishSpin(s: BreakState, l: Listing, auto: boolean) {
  const taken = takenSpots(s)
  const available = s.spots.filter((t) => !taken.has(t))
  if (available.length === 0) {
    l.rand = { status: l.results.length ? 'result' : 'idle', spinIn: 0 }
    return
  }
  const spot = pickOne(s, available)
  // The previous unassigned roll stays on screen during the spin, then gives way to the new one
  l.results = [...l.results.filter((r) => r.assigned), { spot, assigned: auto, auto }]
  l.rand = { status: 'result', spinIn: 0 }
  if (auto) {
    l.flagged = false
    l.wiped = false
    announce(s, l, spot)
  }
}

function announce(s: BreakState, l: Listing, spot: string) {
  if (!l.sale) return
  pushChat(s, 'seller', HOST, `${spot} goes to @${l.sale.buyer}!`)
  logActivity(s, 'assigned', l, { spot })
}

function clone(state: BreakState): BreakState {
  return structuredClone(state)
}

export function reducer(state: BreakState, action: Action): BreakState {
  switch (action.type) {
    case 'TICK': {
      if (!hasActive(state)) return state
      const s = clone(state)
      const dt = action.dt * s.speed
      for (const l of s.listings) {
        if (l.flash) {
          l.flash.remaining -= dt / 1000
          if (l.flash.remaining <= 0) l.flash = null
        }
        if (l.phase === 'live' && l.live) {
          l.live.remaining -= dt / 1000
          l.live.bidIn -= dt
          if (l.live.bidIn <= 0 && l.live.remaining > 0) {
            l.live.bid = l.live.bids === 0 ? 1 + Math.floor(rand(s) * 3) : l.live.bid + 1 + Math.floor(rand(s) * 6)
            l.live.bids += 1
            l.live.leader = pickOne(s, BUYERS.filter((b) => b !== l.live!.leader))
            l.live.bidIn = 900 + rand(s) * 900
            if (!l.suddenDeath && l.live.remaining < 5) l.live.remaining = 5
          }
          if (l.live.remaining <= 0) {
            if (l.live.bids === 0) {
              l.phase = 'unsold'
              l.live = null
            } else {
              sell(s, l, l.live.leader, l.live.bid)
            }
          }
        } else if (l.phase === 'sold' && l.sale && !l.sale.paid) {
          l.sale.paidIn -= dt
          if (l.sale.paidIn <= 0) {
            l.sale.paid = true
            pushChat(s, 'system', 'eBay', `Payment received for #${String(l.id).padStart(3, '0')}`)
            if (l.autoRandomize && l.results.length === 0) startSpin(l)
          }
        }
        if (l.rand.status === 'spinning') {
          l.rand.spinIn -= dt
          if (l.rand.spinIn <= 0) finishSpin(s, l, l.autoRandomize)
        }
      }
      return s
    }

    case 'START': {
      const s = clone(state)
      const l = s.listings.find((x) => x.id === action.id)
      if (!l || l.phase !== 'unsold' || l.format !== 'auction') return state
      if (s.listings.some((x) => x.phase === 'live')) return state
      l.phase = 'live'
      l.live = { remaining: AUCTION_SECONDS, bid: 0, bids: 0, leader: '', bidIn: 700 }
      return s
    }

    case 'END_AUCTION': {
      const s = clone(state)
      const l = s.listings.find((x) => x.id === action.id)
      if (!l || l.phase !== 'live' || !l.live) return state
      if (l.live.bids === 0) {
        l.phase = 'unsold'
        l.live = null
      } else {
        sell(s, l, l.live.leader, l.live.bid)
      }
      return s
    }

    case 'SKIP_TIMER': {
      const s = clone(state)
      const l = s.listings.find((x) => x.phase === 'live' && x.live)
      if (!l || !l.live) return state
      if (l.live.bids === 0) {
        // Nothing to sell with zero bids, so a skipped auction still closes with a winner
        l.live.bid = 1 + Math.floor(rand(s) * 3)
        l.live.bids = 1
        l.live.leader = pickOne(s, BUYERS)
      }
      l.live.remaining = 0
      sell(s, l, l.live.leader, l.live.bid)
      return s
    }

    case 'BUY_BIN': {
      const s = clone(state)
      const l = s.listings.find((x) => x.id === action.id)
      if (!l || l.format !== 'bin' || l.phase !== 'unsold' || !l.purchasable) return state
      const price = l.flash ? Math.round(l.binPrice - (l.binPrice * l.flash.pct) / 100) : l.binPrice
      sell(s, l, pickOne(s, BUYERS), price)
      return s
    }

    case 'RANDOMIZE': {
      const s = clone(state)
      const l = s.listings.find((x) => x.id === action.id)
      if (!l || l.phase !== 'sold' || !l.sale?.paid || l.rand.status === 'spinning') return state
  l.wiped = false
  startSpin(l)
      return s
    }

    case 'ASSIGN': {
      const s = clone(state)
      const l = s.listings.find((x) => x.id === action.id)
      const r = l?.results.find((x) => x.spot === action.spot)
      if (!l || !r || r.assigned) return state
      r.assigned = true
      l.flagged = false
      l.wiped = false
      announce(s, l, r.spot)
      return s
    }

    case 'UNASSIGN': {
      const s = clone(state)
      const l = s.listings.find((x) => x.id === action.id)
      const r = l?.results.find((x) => x.spot === action.spot)
      if (!l || !r || !r.assigned) return state
      r.assigned = false
      logActivity(s, 'unassigned', l, { spot: r.spot })
      return s
    }

    case 'PICK': {
      const s = clone(state)
      const l = s.listings.find((x) => x.id === action.id)
      if (!l || l.phase !== 'sold' || !l.sale?.paid) return state
      const existing = l.results.find((r) => r.spot === action.spot)
      if (existing?.assigned) return state
      if (existing) {
        existing.assigned = true
      } else {
        if (takenSpots(s).has(action.spot)) return state
        // A picked spot is added next to any randomized results, never in place of them
        l.results = [...l.results, { spot: action.spot, assigned: true, auto: false, picked: true }]
      }
      if (l.rand.status === 'idle') l.rand = { status: 'result', spinIn: 0 }
      l.flagged = false
      l.wiped = false
      announce(s, l, action.spot)
      return s
    }

    case 'REMOVE_ASSIGNMENT': {
      const s = clone(state)
      const l = s.listings.find((x) => x.id === action.id)
      if (!l) return state
      for (const r of l.results) {
        if (r.assigned && (action.spot === undefined || r.spot === action.spot)) {
          logActivity(s, 'unassigned', l, { spot: r.spot })
        }
      }
      l.results = l.results.filter((r) => !r.assigned || (action.spot !== undefined && r.spot !== action.spot))
      if (l.results.length === 0) l.rand = { status: 'idle', spinIn: 0 }
      l.autoRandomize = false
      return s
    }

    case 'NAV': {
      const s = clone(state)
      const leaving = s.listings[s.index]
      if (leaving && leaving.phase === 'sold' && leaving.rand.status !== 'spinning') {
        const hasAssigned = leaving.results.some((r) => r.assigned)
        const hasPending = leaving.results.some((r) => !r.assigned)
        if (!hasAssigned || hasPending) leaving.flagged = true
      }
      s.index = Math.max(0, Math.min(s.listings.length - 1, action.index))
      return s
    }

    case 'NEXT_LISTING': {
      const next = state.listings.findIndex((l, i) => i > state.index && l.phase === 'unsold')
      return reducer(state, { type: 'NAV', index: next === -1 ? state.index + 1 : next })
    }

    case 'SET_SUDDEN_DEATH': {
      const s = clone(state)
      const l = s.listings.find((x) => x.id === action.id)
      if (l) l.suddenDeath = action.value
      return s
    }

    case 'SET_AUTO': {
      const s = clone(state)
      const l = s.listings.find((x) => x.id === action.id)
      if (l) l.autoRandomize = action.value
      return s
    }

    case 'SET_AUTO_ALL': {
      const s = clone(state)
      for (const l of s.listings) if (l.phase === 'unsold' || l.phase === 'live') l.autoRandomize = action.value
      return s
    }

    case 'SET_PURCHASABLE': {
      const s = clone(state)
      const l = s.listings.find((x) => x.id === action.id)
      if (l) l.purchasable = action.value
      return s
    }

    case 'START_FLASH': {
      const s = clone(state)
      const l = s.listings.find((x) => x.id === action.id)
      if (l && l.format === 'bin' && l.phase === 'unsold') l.flash = { pct: action.pct, remaining: action.seconds }
      return s
    }

    case 'SET_BREAK_PHASE':
      return { ...state, breakPhase: action.value }
    case 'SET_SHOW_LISTINGS':
      return { ...state, showListings: action.value }
    case 'SET_FILTER':
      return { ...state, filter: action.value }
    case 'SET_PINNED':
      return { ...state, pinned: action.value }
    case 'SET_SPEED':
      return { ...state, speed: action.value }

    case 'ADD_SPOT': {
      const name = action.name.trim()
      if (!name || state.spots.some((t) => t.toLowerCase() === name.toLowerCase())) return state
      return { ...state, spots: [...state.spots, name] }
    }

    case 'REMOVE_SPOT': {
      if (assignedSpotSet(state).has(action.name)) return state
      return { ...state, spots: state.spots.filter((t) => t !== action.name) }
    }

    case 'SEED': {
      const s = initialState()
      const order = [...s.spots]
      for (let i = order.length - 1; i > 0; i--) {
        const j = Math.floor(rand(s) * (i + 1))
        ;[order[i], order[j]] = [order[j], order[i]]
      }
      const n = Math.min(action.assigned, s.listings.length)
      for (let i = 0; i < n; i++) {
        const l = s.listings[i]
        l.phase = 'sold'
        l.sale = {
          buyer: BUYERS[i % BUYERS.length],
          price: 60 + Math.floor(rand(s) * 150),
          atMin: 26 + i,
          paid: true,
          paidIn: 0,
        }
        l.results = [{ spot: order[i], assigned: true, auto: false }]
        l.rand = { status: 'result', spinIn: 0 }
        s.clock = l.sale.atMin
        logActivity(s, 'won', l, { price: l.sale.price })
        logActivity(s, 'assigned', l, { spot: order[i] })
      }
      s.index = Math.min(n, s.listings.length - 1)
      s.clock = 26 + n
      s.breakPhase = action.breakPhase ?? 'idle'
      s.chat = INITIAL_CHAT
      return s
    }

    case 'RESET':
      return initialState()
  }
}

export const BREAK_LABEL = `# ${BREAK_NUMBER}`
