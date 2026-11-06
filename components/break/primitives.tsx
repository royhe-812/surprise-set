'use client'

import { EllipsisVertical } from 'lucide-react'
import { useEffect, useRef, useState, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string
  tone?: 'surface' | 'dark' | 'outline'
  size?: 32 | 24
}

export function IconButton({ label, tone = 'surface', size = 32, className, children, ...rest }: IconButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-full text-eb-ink transition-colors disabled:opacity-40',
        size === 32 ? 'size-8' : 'size-6',
        tone === 'surface' && 'bg-eb-surface hover:bg-eb-line',
        tone === 'dark' && 'bg-eb-ink text-white hover:bg-eb-dark',
        tone === 'outline' && 'border border-eb-grey bg-white hover:bg-eb-surface',
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  )
}

export function Switch({ checked }: { checked: boolean }) {
  return (
    <span
      aria-hidden
      className={cn(
        'relative inline-flex h-6 w-10 shrink-0 items-center rounded-full border-2 transition-colors',
        checked ? 'border-eb-blue bg-eb-blue' : 'border-[#8f8f8f] bg-white',
      )}
    >
      <span
        className={cn(
          'absolute size-[18px] rounded-full border bg-white transition-transform',
          checked ? 'translate-x-[16px] border-white' : 'translate-x-[1px] border-[#8f8f8f]',
        )}
      />
    </span>
  )
}

type MenuProps = {
  label: string
  children: (close: () => void) => ReactNode
  trigger?: (api: { open: boolean; toggle: () => void }) => ReactNode
  align?: 'left' | 'right'
  width?: number
  role?: 'menu' | 'dialog'
}

export function Menu({ label, children, trigger, align = 'right', width = 248, role = 'menu' }: MenuProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const toggle = () => setOpen((o) => !o)
  const close = () => setOpen(false)

  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div ref={ref} className="relative">
      {trigger ? (
        trigger({ open, toggle })
      ) : (
        <IconButton label={label} aria-haspopup="menu" aria-expanded={open} onClick={toggle}>
          <EllipsisVertical className="size-4" />
        </IconButton>
      )}
      {open && (
        <div
          role={role}
          aria-label={label}
          style={{ width }}
          className={cn(
            'eb-pop absolute top-full z-40 mt-1 rounded-2xl bg-white p-2 shadow-eb-float',
            align === 'right' ? 'right-0' : 'left-0',
          )}
        >
          {children(close)}
        </div>
      )}
    </div>
  )
}

const itemClass =
  'flex min-h-10 w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-eb-ink hover:bg-eb-surface disabled:opacity-40 disabled:hover:bg-transparent'

export function MenuItem({
  icon,
  children,
  danger,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { icon?: ReactNode; danger?: boolean }) {
  return (
    <button type="button" role="menuitem" className={cn(itemClass, danger && 'text-eb-red')} {...rest}>
      {icon && <span className="flex size-4 shrink-0 items-center justify-center">{icon}</span>}
      <span className="flex-1">{children}</span>
    </button>
  )
}

export function MenuSwitchItem({
  icon,
  label,
  checked,
  onChange,
}: {
  icon?: ReactNode
  label: string
  checked: boolean
  onChange: (value: boolean) => void
}) {
  return (
    <button
      type="button"
      role="menuitemcheckbox"
      aria-checked={checked}
      className={itemClass}
      onClick={() => onChange(!checked)}
    >
      {icon && <span className="flex size-4 shrink-0 items-center justify-center">{icon}</span>}
      <span className="flex-1">{label}</span>
      <Switch checked={checked} />
    </button>
  )
}

export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span className={cn('text-[10px] leading-3 font-bold tracking-[0.5px] text-eb-grey uppercase', className)}>
      {children}
    </span>
  )
}
