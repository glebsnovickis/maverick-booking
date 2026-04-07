import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '@/app/globals.css'

const inter = Inter({ subsets: ['latin', 'cyrillic'] })

export const metadata: Metadata = {
  title: 'Maverick Barber & Bar',
  description: 'Профессиональная служба бронирования парикмахерской - запишитесь к лучшим барберам',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-[#1a1a1a] text-[#f1f1f1]`}>
        <main>
          {children}
        </main>
      </body>
    </html>
  )
}
