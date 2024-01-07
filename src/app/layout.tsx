import type { Metadata } from 'next'
import './globals.css'
import { ReactNode } from 'react'
import SessionProvider from '@/components/sessionProvider'
import { getServerSession } from 'next-auth'
import { authOptions } from './api/auth/[...nextauth]/route'

export const metadata: Metadata = {
  title: 'Coffee Club Tabs App',
  description: 'Track your Coffee Club Tabs',
}

export default async function RootLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="en">
      <body>
        <SessionProvider session={session}>
        {children}
        </SessionProvider>
      </body>
    </html>
  )
}
