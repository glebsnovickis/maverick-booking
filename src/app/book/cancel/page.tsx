'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Lang, t } from '@/lib/i18n'
import LanguageSwitcher from '@/components/LanguageSwitcher'

function CancelContent() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const [lang, setLang] = useState<Lang>('ru')
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (token) {
      cancelBooking()
    }
  }, [token])

  async function cancelBooking() {
    try {
      setLoading(true)
      const response = await fetch(`/api/bookings?token=${token}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to cancel booking')
      }

      setMessage({
        type: 'success',
        text: lang === 'ru' ? 'Запись успешно отменена' : 'Rezervācija sekmīgi atcelta',
      })
    } catch (err) {
      console.error('Error canceling booking:', err)
      setMessage({
        type: 'error',
        text: err instanceof Error ? err.message : t('error', lang),
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#1a1a1a] text-[#f1f1f1]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#1a1a1a] border-b border-[#404040]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-[#c8a259]">Maverick</h1>
          <LanguageSwitcher lang={lang} onChangeLang={setLang} />
        </div>
      </header>

      {/* Cancel Message */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 text-center">
        {loading ? (
          <p className="text-[#b8b8b8] text-lg">{t('loading', lang)}</p>
        ) : message ? (
          <>
            <div className={`mb-6 text-6xl ${message.type === 'success' ? 'text-green-500' : 'text-red-500'}`}>
              {message.type === 'success' ? '✓' : '✗'}
            </div>
            <h2 className={`text-3xl sm:text-4xl font-bold mb-4 ${message.type === 'success' ? 'text-green-500' : 'text-red-500'}`}>
              {message.text}
            </h2>
            <Link
              href="/"
              className="inline-block btn btn-primary mt-8 min-h-[44px] px-8"
            >
              {t('home', lang)}
            </Link>
          </>
        ) : null}
      </div>
    </div>
  )
}

export default function CancelPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center text-[#c8a259]">Loading...</div>}>
      <CancelContent />
    </Suspense>
  )
}
