import { BreakProvider } from '@/components/break/break-provider'
import { BreakModule } from '@/components/break/break-module'
import { BrowserChrome } from '@/components/console/browser-chrome'
import { ChatPanel } from '@/components/console/chat-panel'
import { PageHeader } from '@/components/console/page-header'
import { PrototypeControls } from '@/components/console/prototype-controls'
import { StreamPanel } from '@/components/console/stream-panel'
import { TopNav } from '@/components/console/top-nav'

export default function Page() {
  return (
    <BreakProvider>
      <div className="overflow-x-auto p-4">
        <div className="mx-auto min-w-[1280px] max-w-[1440px] overflow-hidden rounded-2xl bg-white shadow-eb-float">
          <BrowserChrome />
          <div className="h-[calc(100dvh-32px-80px)] min-h-[640px] overflow-y-auto bg-white">
            <TopNav />
            <div className="relative overflow-hidden">
              <div aria-hidden className="pointer-events-none absolute inset-0">
                {/* eslint-disable @next/next/no-img-element */}
                <img src="/figma/aurora.svg" alt="" className="absolute -top-24 -left-20 w-[700px]" />
                <img src="/figma/aurora-2.svg" alt="" className="absolute -top-64 left-[360px] w-[1100px]" />
                <img src="/figma/aurora-3.svg" alt="" className="absolute top-20 left-[200px] w-[1000px]" />
                <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-white" />
              </div>
              <main className="relative pb-12">
                <PageHeader />
                <div className="mt-[34px] flex items-start gap-4 pr-12 pl-[66px]">
                  <BreakModule />
                  <StreamPanel />
                  <ChatPanel />
                </div>
              </main>
            </div>
          </div>
        </div>
      </div>
      <PrototypeControls />
    </BreakProvider>
  )
}
