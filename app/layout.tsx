import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/Navbar'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Zentribe',
  description: 'Find your people. Find your support.',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#f6f8f9',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      className={geistSans.variable + ' ' + geistMono.variable + ' h-full antialiased'}
    >
      <body className="flex min-h-full flex-col">
        <a href="#content" className="zt-skip">
          Skip to content
        </a>
        <Navbar />
        {children}
      </body>
    </html>
  )
}
