import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Stream manager – Friday case breaks! | eBay Live',
  description:
    'eBay Live host console for running a random case break: sell listings, randomize or pick spots, and track assignments.',
  generator: 'v0.app',
}

export const viewport: Viewport = {
  themeColor: '#e9eaec',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="bg-[#e9eaec]">
      <body className="font-sans antialiased">{children}</body>
    </html>
  )
}
