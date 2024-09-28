import type { Metadata } from 'next'
import localFont from 'next/font/local'
import './globals.css'
import { ConvexClientProvider } from '../providers/convex-client-provider'
import { Toaster } from '@/components/ui/sonner'
import { ModalProvider } from '@/providers/modal-provider'

const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist-sans',
  weight: '100 900',
})
const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
  weight: '100 900',
})

export const metadata: Metadata = {
  title: 'Mirola',
  description: 'Archeitecture and Design tool',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ConvexClientProvider>
          <Toaster />
          <ModalProvider />
          {children}
        </ConvexClientProvider>
      </body>
    </html>
  )
}
