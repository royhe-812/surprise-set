'use client'

import { ChevronLeft } from 'lucide-react'
import { useBreak } from './break-provider'
import { GroupHeader } from './group-header'
import { ListingsSection } from './listings-section'
import { SpotsSection } from './spots-section'

export function BreakModule() {
  const { summary } = useBreak()

  return (
    <section
      aria-label="Surprise set"
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
        <h1 className="text-lg font-bold">Surprise set</h1>
      </header>

      <div className="eb-scroll min-h-0 flex-1 overflow-y-auto">
        <GroupHeader />
        {summary.listingsVisible && <ListingsSection />}
        <SpotsSection />
      </div>
    </section>
  )
}
