import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import BottomNav from '@/components/BottomNav'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Trace — Batch Sustainability Tracker',
  description: 'Track water, electricity, fuel, and waste per production batch. Built for Indian SME manufacturers.',
  manifest: '/manifest.json',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#2A6349',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body className="min-h-screen bg-[#F7F6F3]">
        {/* Main content — padded above bottom nav */}
        <main className="max-w-2xl mx-auto pb-24">
          {children}
        </main>

        {/* Bottom navigation — hidden during print */}
        <div className="no-print">
          <BottomNav />
        </div>
      </body>
    </html>
  )
}
