'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

interface NavItem {
  label: string
  href: string
  icon: string
}

const navItems: NavItem[] = [
  { label: 'Панель управления', href: '/admin', icon: '📊' },
  { label: 'Записи', href: '/admin/bookings', icon: '📅' },
  { label: 'Услуги', href: '/admin/services', icon: '✂️' },
  { label: 'Расписание', href: '/admin/schedule', icon: '⏰' }
]

export default function AdminLayout({
  children
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const {
          data: { session }
        } = await supabase.auth.getSession()

        if (!session) {
          router.push('/admin/login')
          return
        }

        setUserEmail(session.user.email || null)
      } catch (error) {
        console.error('Auth check failed:', error)
        router.push('/admin/login')
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [router])

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      router.push('/admin/login')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#1a1a1a]">
        <div className="text-[#c8a259]">Загрузка...</div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-[#1a1a1a]">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 bg-[#2a2a2a] border-r border-[#404040] flex-col">
        <div className="p-6 border-b border-[#404040]">
          <h1 className="text-2xl font-bold text-[#c8a259]">Barbershop</h1>
          <p className="text-sm text-[#7c7c7c] mt-2">{userEmail}</p>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-[#c8a259] text-[#1a1a1a] font-semibold'
                    : 'text-[#b8b8b8] hover:bg-[#404040]'
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-[#404040]">
          <button
            onClick={handleLogout}
            className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold"
          >
            Выйти
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden bg-[#2a2a2a] border-b border-[#404040] px-4 py-3 flex items-center justify-between">
          <h1 className="text-lg font-bold text-[#c8a259]">Barbershop</h1>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-[#c8a259]"
          >
            ☰
          </button>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>

        {/* Mobile Bottom Navigation */}
        <nav className="md:hidden bg-[#2a2a2a] border-t border-[#404040] flex items-center justify-around">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex-1 flex flex-col items-center justify-center py-3 gap-1 transition-colors ${
                  isActive
                    ? 'bg-[#c8a259] text-[#1a1a1a]'
                    : 'text-[#7c7c7c]'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span className="text-xs">{item.label.split(' ')[0]}</span>
              </Link>
            )
          })}
          <button
            onClick={handleLogout}
            className="flex-1 flex flex-col items-center justify-center py-3 gap-1 text-red-500 hover:bg-red-900/20 transition-colors"
          >
            <span className="text-lg">🚪</span>
            <span className="text-xs">Выход</span>
          </button>
        </nav>
      </div>
    </div>
  )
}
