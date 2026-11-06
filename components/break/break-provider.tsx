'use client'

import { createContext, useContext, useEffect, useMemo, useReducer, type Dispatch, type ReactNode } from 'react'
import { initialState, reducer, type Action } from '@/lib/break/reducer'
import { groupSummary } from '@/lib/break/selectors'
import type { BreakState } from '@/lib/break/types'

type Ctx = {
  state: BreakState
  dispatch: Dispatch<Action>
  summary: ReturnType<typeof groupSummary>
}

const BreakContext = createContext<Ctx | null>(null)

export function BreakProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, initialState)

  useEffect(() => {
    const id = setInterval(() => dispatch({ type: 'TICK', dt: 100 }), 100)
    return () => clearInterval(id)
  }, [])

  const summary = useMemo(() => groupSummary(state), [state])
  const value = useMemo(() => ({ state, dispatch, summary }), [state, summary])

  return <BreakContext.Provider value={value}>{children}</BreakContext.Provider>
}

export function useBreak(): Ctx {
  const ctx = useContext(BreakContext)
  if (!ctx) throw new Error('useBreak must be used inside BreakProvider')
  return ctx
}
