import './globals.css'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Live Auction Platform',
  description: 'Premium live player auctions for team-based games',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <main className="container animate-fade-in">
          {children}
        </main>
      </body>
    </html>
  )
}
