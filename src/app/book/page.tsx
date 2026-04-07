'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Lang, t, getMonthName, getWeekdayName } from '@/lib/i18n'
import { Service, Barber } from '@/lib/types'
import { supabase } from '@/lib/supabase'
import LanguageSwitcher from '@/components/LanguageSwitcher'

type Step = 1 | 2 | 3 | 4 | 5

interface BookingFormData {
  serviceId: string | null
  barberId: string | null
  date: string | null
  time: string | null
  name: string
  phone: string
  email: string
  notes: string
}

interface TimeSlot {
  time: string
  available: boolean
}

export default function BookPage() {
  const router = useRouter()
  const [lang, setLang] = useState<Lang>('ru')
  const [step, setStep] = useState<Step>(1)
  const [services, setServices] = useState<Service[]>([])
  const [barbers, setBarbers] = useState<Barber[]>([])
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([])
  const [calendarMonth, setCalendarMonth] = useState(new Date())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const [formData, setFormData] = useState<BookingFormData>({
    serviceId: null,
    barberId: null,
    date: null,
    time: null,
    name: '',
    phone: '',
    email: '',
    notes: '',
  })

  useEffect(() => {
    if (step === 1) {
      fetchServices()
    } else if (step === 2) {
      fetchBarbers()
    } else if (step === 3 && formData.serviceId && formData.barberId && formData.date) {
      fetchTimeSlots()
    }
  }, [step, formData.serviceId, formData.barberId, formData.date])

  async function fetchServices() {
    try {
      const { data, error: err } = await supabase
        .from('services')
        .select('*')
        .eq('is_active', true)
        .order('created_at')

      if (err) throw err
      setServices(data || [])
    } catch (err) {
      console.error('Error fetching services:', err)
      setError(t('error', lang))
    }
  }

  async function fetchBarbers() {
    try {
      const { data, error: err } = await supabase
        .from('barbers')
        .select('*')
        .eq('is_active', true)
        .order('created_at')

      if (err) throw err
      setBarbers(data || [])
    } catch (err) {
      console.error('Error fetching barbers:', err)
      setError(t('error', lang))
    }
  }

  async function fetchTimeSlots() {
    if (!formData.date || !formData.barberId || !formData.serviceId) return

    try {
      setLoading(true)
      const response = await fetch(
        `/api/slots?date=${formData.date}&barber_id=${formData.barberId}&service_id=${formData.serviceId}`
      )

      if (!response.ok) throw new Error('Failed to fetch slots')

      const slots = await response.json()
      setTimeSlots(slots)
    } catch (err) {
      console.error('Error fetching slots:', err)
      setError(t('error', lang))
    } finally {
      setLoading(false)
    }
  }

  function handleNext() {
    if (step < 5) {
      setStep((step + 1) as Step)
      setError(null)
    }
  }

  function handleBack() {
    if (step > 1) {
      setStep((step - 1) as Step)
      setError(null)
    }
  }

  async function handleSubmit() {
    if (!formData.name || !formData.phone || !formData.serviceId || !formData.barberId || !formData.date || !formData.time) {
      setError('Please fill all required fields')
      return
    }

    try {
      setSubmitting(true)
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_name: formData.name,
          client_phone: formData.phone,
          client_email: formData.email || null,
          service_id: formData.serviceId,
          barber_id: formData.barberId,
          date: formData.date,
          start_time: formData.time,
          notes: formData.notes || null,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to create booking')
      }

      const { id } = await response.json()
      router.push(`/book/success?id=${id}`)
    } catch (err) {
      console.error('Error submitting booking:', err)
      setError(err instanceof Error ? err.message : t('error', lang))
    } finally {
      setSubmitting(false)
    }
  }

  const selectedService = services.find(s => s.id === formData.serviceId)
  const selectedBarber = barbers.find(b => b.id === formData.barberId)

  return (
    <div className="min-h-screen bg-[#1a1a1a] text-[#f1f1f1]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#1a1a1a] border-b border-[#404040]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-[#c8a259]">Maverick</h1>
          <LanguageSwitcher lang={lang} onChangeLang={setLang} />
        </div>
      </header>

      {/* Progress Indicator */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex justify-between items-center mb-8">
          {[1, 2, 3, 4, 5].map(s => (
            <div key={s} className="flex flex-col items-center flex-1">
              <div
                className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center font-semibold transition-colors ${
                  s <= step
                    ? 'bg-[#c8a259] text-[#1a1a1a]'
                    : 'bg-[#2a2a2a] text-[#7c7c7c] border border-[#404040]'
                }`}
              >
                {s}
              </div>
              {s < 5 && (
                <div
                  className={`flex-1 h-1 mx-1 ${
                    s < step ? 'bg-[#c8a259]' : 'bg-[#404040]'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {error && (
          <div className="mb-6 p-4 bg-red-900 border border-red-700 rounded-lg text-red-100">
            {error}
          </div>
        )}

        {/* Step 1: Select Service */}
        {step === 1 && (
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold mb-8">{t('select_service', lang)}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {services.map(service => {
                const serviceName = lang === 'lv' ? service.name_lv : service.name_ru
                const serviceDesc = lang === 'lv' ? service.description_lv : service.description_ru
                return (
                  <button
                    key={service.id}
                    onClick={() => setFormData({ ...formData, serviceId: service.id })}
                    className={`card p-4 text-left transition-all ${
                      formData.serviceId === service.id
                        ? 'border-[#c8a259] bg-[#1a1a1a]'
                        : 'hover:border-[#c8a259]'
                    }`}
                  >
                    <h3 className="text-lg font-semibold text-[#c8a259] mb-2">{serviceName}</h3>
                    {serviceDesc && (
                      <p className="text-[#b8b8b8] text-sm mb-3">{serviceDesc}</p>
                    )}
                    <div className="flex justify-between text-sm">
                      <span className="text-[#b8b8b8]">
                        {service.duration_minutes} {t('minutes', lang)}
                      </span>
                      <span className="text-[#c8a259] font-semibold">
                        {service.price} {t('eur', lang)}
                      </span>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Step 2: Select Barber */}
        {step === 2 && (
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold mb-8">{t('select_barber', lang)}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {barbers.map(barber => {
                const barberName = lang === 'lv' && barber.name_lv ? barber.name_lv : barber.name
                const barberBio = lang === 'lv' ? barber.bio_lv : barber.bio_ru
                return (
                  <button
                    key={barber.id}
                    onClick={() => setFormData({ ...formData, barberId: barber.id })}
                    className={`card text-left transition-all ${
                      formData.barberId === barber.id
                        ? 'border-[#c8a259] bg-[#1a1a1a]'
                        : 'hover:border-[#c8a259]'
                    }`}
                  >
                    {barber.photo_url && (
                      <div className="mb-3 h-32 bg-[#1a1a1a] rounded-lg overflow-hidden">
                        <img
                          src={barber.photo_url}
                          alt={barberName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <h3 className="text-lg font-semibold text-[#c8a259] mb-1">{barberName}</h3>
                    {barberBio && (
                      <p className="text-[#b8b8b8] text-sm">{barberBio}</p>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Step 3: Select Date and Time */}
        {step === 3 && (
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold mb-8">{t('select_date', lang)}</h2>

            {/* Calendar */}
            <div className="card mb-8">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-[#c8a259]">
                  {getMonthName(calendarMonth.getMonth(), lang)} {calendarMonth.getFullYear()}
                </h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1))}
                    className="btn btn-secondary"
                  >
                    ←
                  </button>
                  <button
                    onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1))}
                    className="btn btn-secondary"
                  >
                    →
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-2">
                {[0, 1, 2, 3, 4, 5, 6].map(day => (
                  <div key={`weekday-${day}`} className="text-center text-[#7c7c7c] text-sm font-semibold py-2">
                    {getWeekdayName(day, lang)}
                  </div>
                ))}

                {Array.from(
                  { length: (new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), 1).getDay() + 6) % 7 },
                  (_, i) => (
                    <div key={`empty-${i}`} />
                  )
                )}

                {Array.from(
                  { length: new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 0).getDate() },
                  (_, i) => {
                    const date = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), i + 1)
                    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
                    const now = new Date()
                    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
                    const _isToday = dateStr === todayStr
                    const isPast = dateStr < todayStr
                    const isSelected = formData.date === dateStr

                    return (
                      <button
                        key={i}
                        onClick={() => setFormData({ ...formData, date: dateStr, time: null })}
                        disabled={isPast}
                        className={`py-2 rounded-md font-semibold transition-colors min-h-[44px] ${
                          isSelected
                            ? 'bg-[#c8a259] text-[#1a1a1a]'
                            : isPast
                            ? 'bg-[#1a1a1a] text-[#7c7c7c] cursor-not-allowed opacity-50'
                            : 'bg-[#2a2a2a] text-[#f1f1f1] border border-[#404040] hover:border-[#c8a259]'
                        }`}
                      >
                        {i + 1}
                      </button>
                    )
                  }
                )}
              </div>
            </div>

            {/* Time Slots */}
            {formData.date && (
              <div>
                <h3 className="text-xl font-semibold mb-4 text-[#f1f1f1]">{t('select_time', lang)}</h3>
                {loading ? (
                  <p className="text-[#b8b8b8]">{t('loading', lang)}</p>
                ) : timeSlots.length === 0 ? (
                  <p className="text-[#b8b8b8]">{t('no_slots', lang)}</p>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                    {timeSlots.map(slot => (
                      <button
                        key={slot.time}
                        onClick={() => slot.available && setFormData({ ...formData, time: slot.time })}
                        disabled={!slot.available}
                        className={`py-2 rounded-md font-semibold transition-colors min-h-[44px] text-sm ${
                          formData.time === slot.time
                            ? 'bg-[#c8a259] text-[#1a1a1a]'
                            : !slot.available
                            ? 'bg-red-900/40 text-red-400 border border-red-800/50 cursor-not-allowed line-through'
                            : 'bg-[#2a2a2a] text-[#f1f1f1] border border-[#404040] hover:border-[#c8a259]'
                        }`}
                      >
                        {slot.time}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Step 4: Contact Info */}
        {step === 4 && (
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold mb-8">{t('your_info', lang)}</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-[#f1f1f1] font-medium mb-2">
                  {t('name', lang)} *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="John Doe"
                  className="w-full px-4 py-2 bg-[#2a2a2a] text-[#f1f1f1] border border-[#404040] rounded-lg focus:border-[#c8a259] focus:ring-1 focus:ring-[#c8a259] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[#f1f1f1] font-medium mb-2">
                  {t('phone', lang)} *
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+371 XX XXX XXX"
                  className="w-full px-4 py-2 bg-[#2a2a2a] text-[#f1f1f1] border border-[#404040] rounded-lg focus:border-[#c8a259] focus:ring-1 focus:ring-[#c8a259] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[#f1f1f1] font-medium mb-2">
                  {t('email', lang)}
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  placeholder="example@email.com"
                  className="w-full px-4 py-2 bg-[#2a2a2a] text-[#f1f1f1] border border-[#404040] rounded-lg focus:border-[#c8a259] focus:ring-1 focus:ring-[#c8a259] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[#f1f1f1] font-medium mb-2">
                  {t('notes', lang)}
                </label>
                <textarea
                  value={formData.notes}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  placeholder={lang === 'ru' ? 'Дополнительные заметки...' : 'Papildu piezīmes...'}
                  rows={4}
                  className="w-full px-4 py-2 bg-[#2a2a2a] text-[#f1f1f1] border border-[#404040] rounded-lg focus:border-[#c8a259] focus:ring-1 focus:ring-[#c8a259] focus:outline-none resize-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 5: Confirmation */}
        {step === 5 && (
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold mb-8">{t('confirm_booking', lang)}</h2>
            <div className="card space-y-4">
              <div className="border-b border-[#404040] pb-4">
                <p className="text-[#7c7c7c] text-sm mb-1">{t('select_service', lang)}</p>
                <p className="text-[#f1f1f1] font-semibold">{lang === 'lv' ? selectedService?.name_lv : selectedService?.name_ru}</p>
              </div>

              <div className="border-b border-[#404040] pb-4">
                <p className="text-[#7c7c7c] text-sm mb-1">{t('select_barber', lang)}</p>
                <p className="text-[#f1f1f1] font-semibold">{lang === 'lv' && selectedBarber?.name_lv ? selectedBarber.name_lv : selectedBarber?.name}</p>
              </div>

              <div className="border-b border-[#404040] pb-4">
                <p className="text-[#7c7c7c] text-sm mb-1">{t('select_date', lang)}</p>
                <p className="text-[#f1f1f1] font-semibold">{formData.date}</p>
              </div>

              <div className="border-b border-[#404040] pb-4">
                <p className="text-[#7c7c7c] text-sm mb-1">{t('select_time', lang)}</p>
                <p className="text-[#f1f1f1] font-semibold">{formData.time}</p>
              </div>

              <div>
                <p className="text-[#7c7c7c] text-sm mb-1">{t('name', lang)}</p>
                <p className="text-[#f1f1f1] font-semibold">{formData.name}</p>
              </div>

              <div>
                <p className="text-[#7c7c7c] text-sm mb-1">{t('phone', lang)}</p>
                <p className="text-[#f1f1f1] font-semibold">{formData.phone}</p>
              </div>

              {formData.email && (
                <div>
                  <p className="text-[#7c7c7c] text-sm mb-1">{t('email', lang)}</p>
                  <p className="text-[#f1f1f1] font-semibold">{formData.email}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex gap-4 mt-12">
          <button
            onClick={handleBack}
            disabled={step === 1}
            className="btn btn-secondary disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]"
          >
            {t('back', lang)}
          </button>

          {step < 5 ? (
            <button
              onClick={handleNext}
              disabled={
                (step === 1 && !formData.serviceId) ||
                (step === 2 && !formData.barberId) ||
                (step === 3 && (!formData.date || !formData.time)) ||
                (step === 4 && (!formData.name || !formData.phone))
              }
              className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex-1 min-h-[44px]"
            >
              {t('next', lang)}
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex-1 min-h-[44px]"
            >
              {submitting ? t('loading', lang) : t('submit', lang)}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
