import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Suzuka Map',
  description: 'Interactive map of Suzuka Circuit',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  )
}

