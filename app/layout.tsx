import type { Metadata } from 'next'
import './globals.css'
import { Navigation } from '@/components/navigation'
import { AuthProvider } from '@/contexts/auth-context'
import { aeonik, hakenGrotesk } from './fonts'

export const metadata: Metadata = {
  title: 'Alx Polly - Create and Share Polls',
  description: 'Create, share and participate in polls with Alx Polly',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${hakenGrotesk.variable} ${aeonik.variable} font-haken`}>
        <AuthProvider>
          <Navigation />
          <main>{children}</main>
        </AuthProvider>
      </body>
    </html>
  )
}
