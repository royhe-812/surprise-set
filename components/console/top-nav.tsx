import { Search } from 'lucide-react'
import Image from 'next/image'

function Chevron() {
  return <Image src="/figma/chevron-down-12.svg" alt="" width={16} height={16} className="size-4" />
}

function EbayLogo() {
  return (
    <span role="img" aria-label="eBay" className="relative block h-[47px] w-[117px] shrink-0">
      <Image src="/figma/fill-3.svg" alt="" width={30} height={28} className="absolute top-[10px] left-0 h-7 w-[30px]" />
      <Image src="/figma/fill-5.svg" alt="" width={31} height={38} className="absolute top-0 left-[28px] h-[38px] w-[31px]" />
      <Image src="/figma/fill-1.svg" alt="" width={28} height={28} className="absolute top-[10px] left-[58px] h-7 w-7" />
      <Image src="/figma/fill-7.svg" alt="" width={33} height={36} className="absolute top-[10px] left-[84px] h-9 w-[33px]" />
    </span>
  )
}

export function TopNav() {
  return (
    <header className="bg-white px-12">
      <div className="flex h-8 items-center justify-between border-b border-eb-line py-1 text-xs leading-4 text-black">
        <div className="flex items-center gap-8">
          <button type="button" className="flex items-center gap-[3px]">
            Hi <b>[name]</b>
            <Chevron />
          </button>
          <nav aria-label="Secondary" className="flex gap-4">
            <a href="#">Daily Deals</a>
            <a href="#">Brand Outlet</a>
            <a href="#">Help &amp; Contact</a>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <a href="#">Sell</a>
          <button type="button" className="flex items-center">
            Watchlist
            <Chevron />
          </button>
          <button type="button" className="flex items-center">
            My eBay
            <Chevron />
          </button>
          <button type="button" aria-label="Notifications">
            <Image src="/figma/notification-20.svg" alt="" width={20} height={20} className="size-5" />
          </button>
          <button type="button" aria-label="Cart">
            <Image src="/figma/cart-20.svg" alt="" width={20} height={20} className="size-5" />
          </button>
        </div>
      </div>

      <div className="flex h-[76px] items-center gap-12 border-b border-eb-line">
        <EbayLogo />
        <button type="button" className="flex items-center gap-1 text-sm text-eb-grey">
          Shop by category
          <Chevron />
        </button>
        <form role="search" className="flex h-[46px] flex-1 items-center overflow-hidden rounded-full border border-[#8f8f8f]">
          <Search className="ml-4 size-5 text-eb-grey" aria-hidden />
          <input
            aria-label="Search for anything"
            placeholder="Search for anything"
            className="h-full flex-1 bg-transparent px-3 text-base outline-none placeholder:text-eb-grey"
          />
          <span className="flex h-full items-center gap-2 border-l border-eb-line px-4 text-sm text-eb-grey">
            All Categories
            <Chevron />
          </span>
        </form>
        <button type="submit" className="h-[46px] w-[148px] rounded-full bg-eb-blue text-base font-bold text-white">
          Search
        </button>
        <a href="#" className="text-sm text-eb-grey">
          Advanced
        </a>
      </div>
    </header>
  )
}
