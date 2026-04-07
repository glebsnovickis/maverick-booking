'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Lang, t } from '@/lib/i18n'
import { Service, Barber } from '@/lib/types'
import { supabase } from '@/lib/supabase'
import LanguageSwitcher from '@/components/LanguageSwitcher'

export default function Home() {
  const [lang, setLang] = useState<Lang>('ru')
  const [services, setServices] = useState<Service[]>([])
  const [barbers, setBarbers] = useState<Barber[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    try {
      setLoading(true)
      const [servicesRes, barbersRes] = await Promise.all([
        supabase
          .from('services')
          .select('*')
          .eq('is_active', true)
          .order('created_at'),
        supabase
          .from('barbers')
          .select('*')
          .eq('is_active', true)
          .order('created_at')
      ])

      if (servicesRes.error) throw servicesRes.error
      if (barbersRes.error) throw barbersRes.error

      setServices(servicesRes.data || [])
      setBarbers(barbersRes.data || [])
    } catch (err) {
      console.error('Error fetching data:', err)
      setError('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#1a1a1a] text-[#f1f1f1]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#1a1a1a] border-b border-[#404040]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-[#c8a259]">Maverick</h1>
          <LanguageSwitcher lang={lang} onChangeLang={setLang} />
        </div>
      </header>

      {/* Hero Section */}
      <section className="px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-24">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4 text-[#f1f1f1]">
            Maverick Barber & Bar
          </h2>
          <p className="text-lg sm:text-xl text-[#b8b8b8] mb-8">
            {lang === 'ru'
              ? 'Профессиональная парикмахерская с лучшими барберами в городе'
              : 'Profesionāls frīzerskops ar labākajiem frīzeriem pilsētā'}
          </p>
          <Link
            href="/book"
            className="inline-block bg-[#c8a259] text-[#1a1a1a] px-8 py-3 rounded-lg font-semibold hover:bg-[#d4b36d] transition-colors min-h-[44px] flex items-center"
          >
            {t('book_now', lang)}
          </Link>
        </div>
      </section>

      {/* Services Section */}
      <section className="px-4 sm:px-6 lg:px-8 py-12 sm:py-16 bg-[#0f0f0f]">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-3xl sm:text-4xl font-bold mb-12 text-center text-[#f1f1f1]">
            {t('services', lang)}
          </h3>
          {loading ? (
            <div className="text-center text-[#b8b8b8]">{t('loading', lang)}</div>
          ) : error ? (
            <div className="text-center text-red-400">{error}</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map(service => {
                const serviceName = lang === 'lv' ? service.name_lv : service.name_ru
                const serviceDesc = lang === 'lv' ? service.description_lv : service.description_ru
                return (
                  <div key={service.id} className="card">
                    <h4 className="text-xl font-semibold mb-2 text-[#c8a259]">{serviceName}</h4>
                    {serviceDesc && (
                      <p className="text-[#b8b8b8] mb-4 text-sm">{serviceDesc}</p>
                    )}
                    <div className="flex justify-between text-[#b8b8b8] text-sm">
                      <span>{t('duration', lang)}: {service.duration_minutes} {t('minutes', lang)}</span>
                      <span className="text-[#c8a259] font-semibold">{service.price} {t('eur', lang)}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </section>

      {/* Barbers Section */}
      <section className="px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-3xl sm:text-4xl font-bold mb-12 text-center text-[#f1f1f1]">
            {lang === 'ru' ? 'Наши барберы' : 'Mūsu frizieri'}
          </h3>
          {loading ? (
            <div className="text-center text-[#b8b8b8]">{t('loading', lang)}</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {barbers.map(barber => {
                const barberName = lang === 'lv' && barber.name_lv ? barber.name_lv : barber.name
                const barberBio = lang === 'lv' ? barber.bio_lv : barber.bio_ru
                return (
                  <div key={barber.id} className="card text-center">
                    {barber.photo_url && (
                      <div className="mb-4 h-40 bg-[#1a1a1a] rounded-lg overflow-hidden">
                        <img
                          src={barber.photo_url}
                          alt={barberName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <h4 className="text-xl font-semibold mb-2 text-[#c8a259]">{barberName}</h4>
                    {barberBio && (
                      <p className="text-[#b8b8b8] text-sm">{barberBio}</p>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </section>

      {/* Contact Section */}
      <section className="px-4 sm:px-6 lg:px-8 py-12 sm:py-16 bg-[#0f0f0f]">
        <div className="max-w-2xl mx-auto text-center">
          <h3 className="text-3xl sm:text-4xl font-bold mb-8 text-[#f1f1f1]">
            {t('contacts', lang)}
          </h3>
          <div className="space-y-4 text-[#b8b8b8]">
            <p>
              {lang === 'ru' ? 'Адрес:' : 'Adrese:'} Riga, Latvia
            </p>
            <p>
              {lang === 'ru' ? 'Телефон:' : 'Tālrunis:'} +371 XX XXX XXX
            </p>
            <p>
              {lang === 'ru' ? 'Email:' : 'E-pasts:'} info@maverickbarber.lv
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
