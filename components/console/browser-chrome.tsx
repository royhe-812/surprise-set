import { ArrowLeft, ArrowRight, Home, Lock, RotateCw, Star, Plus, X, EllipsisVertical, User } from 'lucide-react'

export function BrowserChrome() {
  return (
    <div aria-hidden className="select-none bg-[#1f2020] text-[#d9d9d9]">
      <div className="flex h-[42px] items-end gap-3 px-5">
        <div className="mb-3 flex gap-2">
          <span className="size-3 rounded-full bg-[#ff6058]" />
          <span className="size-3 rounded-full bg-[#ffc130]" />
          <span className="size-3 rounded-full bg-[#27ca40]" />
        </div>
        <div className="ml-6 flex h-[34px] w-[167px] items-center gap-2 rounded-t-lg bg-[#3c3c3c] px-3 text-sm text-white">
          <span className="grid size-4 grid-cols-2 gap-px overflow-hidden rounded-sm">
            <i className="bg-[#e53238]" />
            <i className="bg-[#0064d2]" />
            <i className="bg-[#f5af02]" />
            <i className="bg-[#86b817]" />
          </span>
          <span className="flex-1">eBay</span>
          <X className="size-3.5 text-[#979797]" />
        </div>
        <Plus className="mb-2.5 size-4 text-[#d9d9d9]" />
      </div>
      <div className="flex h-[38px] items-center gap-4 bg-[#3c3c3c] px-5">
        <ArrowLeft className="size-4" />
        <ArrowRight className="size-4 text-[#979797]" />
        <RotateCw className="size-4" />
        <Home className="size-4" />
        <div className="flex h-7 flex-1 items-center gap-2 rounded-full bg-[#282828] px-4 text-sm text-white">
          <Lock className="size-3.5" />
          ebay.com/live
          <Star className="ml-auto size-4 text-[#979797]" />
        </div>
        <span className="grid size-7 place-items-center rounded-full bg-[#d8d8d8] text-[#5f6368]">
          <User className="size-4" />
        </span>
        <EllipsisVertical className="size-4" />
      </div>
    </div>
  )
}
