export type Result = { spot: string; assigned: boolean; auto: boolean }

export type Phase = 'unsold' | 'live' | 'sold'

export type Listing = {
  id: number
  title: string
  format: 'auction' | 'bin'
  startPrice: number
  binPrice: number
  suddenDeath: boolean
  autoRandomize: boolean
  purchasable: boolean
  flash: { pct: number; remaining: number } | null
  phase: Phase
  live: { remaining: number; bid: number; bids: number; leader: string; bidIn: number } | null
  sale: { buyer: string; price: number; atMin: number; paid: boolean; paidIn: number } | null
  rand: { status: 'idle' | 'spinning' | 'result'; spinIn: number }
  results: Result[]
  /** Seller moved on before assigning: show the "needs action" treatment. */
  flagged: boolean
  /** Unassigned results were discarded because another listing sold. */
  wiped: boolean
}

export type ChatKind = 'user' | 'seller' | 'follow' | 'join' | 'system'

export type ChatMessage = {
  id: number
  kind: ChatKind
  user: string
  text?: string
  atMin: number
}

export type SpotFilter = 'available' | 'assigned' | 'all'
export type BreakPhase = 'idle' | 'breaking' | 'done'

export type BreakState = {
  listings: Listing[]
  spots: string[]
  index: number
  breakPhase: BreakPhase
  /** null = automatic (hidden once every spot is assigned). */
  showListings: boolean | null
  pinned: boolean
  filter: SpotFilter
  seed: number
  clock: number
  speed: number
  chat: ChatMessage[]
  chatId: number
}

export type SpotAssignment = {
  spot: string
  listingId: number
  buyer: string
  price: number
  atMin: number
}
