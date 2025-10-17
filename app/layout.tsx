import './globals.css'
import type { ReactNode } from 'react'

export const metadata = {
  title: 'Limi.to',
  description: 'The cleanest way to create links that expire when you want.'
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        {children}
      </body>
    </html>
  )
}

