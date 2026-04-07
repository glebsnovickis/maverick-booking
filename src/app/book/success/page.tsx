'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Lang, t } from '@/lib/i18n'
import { BookingWithDetails } from '@/lib/types'
import { supabase } from '@/lib/supabase'
import LanguageSwitcher from '@/components/LanguageSwitcher'

function SuccessContent() {
  const searchParams = useSearchParams()
  const bookingId = searchParams.get('id')
  const [lang, setLang] = useState<Lang>('ru')
  const [booking, setBooking] = useState<BookingWithDetails | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (bookingId) {
      fetchBooking()
    }
  }, [bookingId])

  async function fetchBooking() {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(
          `
          *,
          service:services(*),
          barber:barbers(*)
          `
        )
        .eq('id', bookingId)
        .single()

      if (error) throw error
      setBooking(data)
    } catch (err) {
      console.error('Error fetching booking:', err)
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

      {/* Success Message */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="text-center mb-12">
          <div className="mb-6 text-6xl">✓</div>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-[#c8a259]">
            {lang === 'ru' ? 'Вы записаны!' : 'Jūs esat pierakstījies!'}
          </h2>
          <p className="text-lg text-[#b8b8b8]">
            {t('we_will_contact', lang)}
          </p>
        </div>

        {/* Booking Details */}
        {loading ? (
          <div className="text-center text-[#b8b8b8]">{t('loading', lang)}</div>
        ) : booking ? (
          <div className="card mb-8">
            <h3 className="text-xl font-semibold mb-6 text-[#c8a259]">{t('booking_details', lang)}</h3>
            <div className="space-y-4">
              <div className="border-b border-[#404040] pb-4">
                <p className="text-[#7c7c7c] text-sm mb-1">{lang === 'ru' ? 'Номер записи' : 'Rezervācijas numurs'}</p>
                <p className="text-[#f1f1f1] font-semibold font-mono text-sm">{booking.id}</p>
              </div>

              <div className="border-b border-[#404040] pb-4">
                <p className="text-[#7c7c7c] text-sm mb-1">{t('select_service', lang)}</p>
                <p className="text-[#f1f1f1] font-semibold">{lang === 'lv' ? booking.service?.name_lv : booking.service?.name_ru}</p>
              </div>

              <div className="border-b border-[#404040] pb-4">
                <p className="text-[#7c7c7c] text-sm mb-1">{t('select_barber', lang)}</p>
                <p className="text-[#f1f1f1] font-semibold">{lang === 'lv' && booking.barber?.name_lv ? booking.barber.name_lv : booking.barber?.name}</p>
              </div>

              <div className="border-b border-[#404040] pb-4">
                <p className="text-[#7c7c7c] text-sm mb-1">{t('select_date', lang)}</p>
                <p className="text-[#f1f1f1] font-semibold">{booking.date}</p>
              </div>

              <div className="border-b border-[#404040] pb-4">
                <p className="text-[#7c7c7c] text-sm mb-1">{t('select_time', lang)}</p>
                <p className="text-[#f1f1f1] font-semibold">{booking.start_time}</p>
              </div>

              <div>
                <p className="text-[#7c7c7c] text-sm mb-1">{t('name', lang)}</p>
                <p className="text-[#f1f1f1] font-semibold">{booking.client_name}</p>
              </div>
            </div>
          </div>
        ) : null}

        {/* Action Links */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href="/"
            className="btn btn-primary flex-1 text-center min-h-[44px] flex items-center justify-center"
          >
            {t('home', lang)}
          </Link>
          <Link
            href={`/book/cancel?id=${bookingId}`}
            className="btn btn-secondary flex-1 text-center min-h-[44px] flex items-center justify-center"
          >
            {t('cancel', lang)}
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center text-[#c8a259]">Loading...</div>}>
      <SuccessContent />
    </Suspense>
  )
}
