import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'DFS Demo App',
  description: 'Skill-based DFS Demo (More or Less)',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
