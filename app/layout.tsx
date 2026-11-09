import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Stream manager – Friday watch surprise sets! | eBay Live',
  description:
    'eBay Live host console for running a watch surprise set: sell listings, randomize the reveal, and track assignments.',
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
