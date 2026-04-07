'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [checkingAuth, setCheckingAuth] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const {
          data: { session }
        } = await supabase.auth.getSession()

        if (session) {
          router.push('/admin')
        }
      } catch (error) {
        console.error('Auth check failed:', error)
      } finally {
        setCheckingAuth(false)
      }
    }

    checkAuth()
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) {
        setError(error.message)
        return
      }

      router.push('/admin')
    } catch (err) {
      setError('Ошибка при входе. Попробуйте еще раз.')
      console.error('Login error:', err)
    } finally {
      setLoading(false)
    }
  }

  if (checkingAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#1a1a1a]">
        <div className="text-[#c8a259]">Загрузка...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#c8a259] mb-2">Barbershop</h1>
          <p className="text-[#7c7c7c]">Вход в админ-панель</p>
        </div>

        {/* Card */}
        <div className="bg-[#2a2a2a] border border-[#404040] rounded-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-[#f1f1f1] font-medium mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                disabled={loading}
                className="w-full px-4 py-3 bg-[#1a1a1a] text-[#f1f1f1] border border-[#404040] rounded-lg focus:border-[#c8a259] focus:ring-1 focus:ring-[#c8a259] focus:outline-none transition-colors disabled:opacity-50"
                required
              />
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-[#f1f1f1] font-medium mb-2">
                Пароль
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                disabled={loading}
                className="w-full px-4 py-3 bg-[#1a1a1a] text-[#f1f1f1] border border-[#404040] rounded-lg focus:border-[#c8a259] focus:ring-1 focus:ring-[#c8a259] focus:outline-none transition-colors disabled:opacity-50"
                required
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-900/30 border border-red-600 text-red-200 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#c8a259] hover:bg-[#d4b36d] active:bg-[#b89450] disabled:opacity-50 disabled:cursor-not-allowed text-[#1a1a1a] font-semibold py-3 rounded-lg transition-colors"
            >
              {loading ? 'Загрузка...' : 'Войти'}
            </button>
          </form>

          {/* Info */}
          <div className="mt-6 pt-6 border-t border-[#404040]">
            <p className="text-[#7c7c7c] text-sm text-center">
              Не знаете пароль?
              <br />
              Свяжитесь с администратором
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
