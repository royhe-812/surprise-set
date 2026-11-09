import { EllipsisVertical, PanelLeftOpen } from 'lucide-react'
import { cn } from '@/lib/utils'

const TABS = ['Event information', 'Listings', 'Share event', 'Stream manager']

export function PageHeader() {
  return (
    <div className="px-12">
      <div className="flex h-8 items-center pt-[5px] pl-[16px]">
        <button type="button" aria-label="Open event menu" className="text-eb-ink">
          <PanelLeftOpen className="size-6" />
        </button>
      </div>

      <div className="mt-[41px] flex items-center gap-4 pl-[16px]">
        <h1 className="text-[28px] leading-[48px] font-bold text-eb-ink">Friday watch surprise sets!</h1>
        <button
          type="button"
          aria-label="Event options"
          className="inline-flex size-12 items-center justify-center rounded-full bg-white/60"
        >
          <EllipsisVertical className="size-5" />
        </button>
      </div>

      <nav aria-label="Event sections" className="mt-[9px] flex gap-12 pl-[16px]">
        {TABS.map((tab) => {
          const active = tab === 'Stream manager'
          return (
            <a
              key={tab}
              href="#"
              aria-current={active ? 'page' : undefined}
              className={cn(
                'flex h-10 items-center border-b-2 text-base',
                active ? 'border-eb-ink font-bold text-eb-ink' : 'border-transparent text-eb-grey',
              )}
            >
              {tab}
            </a>
          )
        })}
      </nav>
    </div>
  )
}
