'use client'

import { useState, useEffect } from 'react'
import { Barber, Schedule } from '@/lib/types'

interface ScheduleData {
  [dayOfWeek: number]: {
    is_active: boolean
    start_time: string
    end_time: string
  }
}

const DAYS = [
  { number: 1, name: 'Понедельник' },
  { number: 2, name: 'Вторник' },
  { number: 3, name: 'Среда' },
  { number: 4, name: 'Четверг' },
  { number: 5, name: 'Пятница' },
  { number: 6, name: 'Суббота' },
  { number: 0, name: 'Воскресенье' }
]

export default function SchedulePage() {
  const [barbers, setBarbers] = useState<Barber[]>([])
  const [selectedBarberId, setSelectedBarberId] = useState<string>('')
  const [_schedules, setSchedules] = useState<Schedule[]>([])
  const [scheduleData, setScheduleData] = useState<ScheduleData>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    fetchBarbers()
  }, [])

  useEffect(() => {
    if (selectedBarberId) {
      fetchSchedules()
    }
  }, [selectedBarberId])

  const fetchBarbers = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/barbers')

      if (!response.ok) {
        throw new Error('Failed to fetch barbers')
      }

      const data = await response.json()
      setBarbers(data)

      if (data.length > 0) {
        setSelectedBarberId(data[0].id)
      }
    } catch (err) {
      console.error('Error fetching barbers:', err)
      setError('Ошибка загрузки барберов')
    } finally {
      setLoading(false)
    }
  }

  const fetchSchedules = async () => {
    try {
      const response = await fetch(`/api/admin/schedule?barber_id=${selectedBarberId}`)

      if (!response.ok) {
        throw new Error('Failed to fetch schedules')
      }

      const data: Schedule[] = await response.json()
      setSchedules(data)

      const newScheduleData: ScheduleData = {}
      DAYS.forEach((day) => {
        const daySchedule = data.find((s) => s.day_of_week === day.number)
        newScheduleData[day.number] = daySchedule
          ? {
              is_active: daySchedule.is_working,
              start_time: daySchedule.start_time,
              end_time: daySchedule.end_time
            }
          : {
              is_active: true,
              start_time: '09:00',
              end_time: '18:00'
            }
      })
      setScheduleData(newScheduleData)
    } catch (err) {
      console.error('Error fetching schedules:', err)
      setError('Ошибка загрузки расписания')
    }
  }

  const handleDayToggle = (dayOfWeek: number) => {
    setScheduleData((prev) => ({
      ...prev,
      [dayOfWeek]: {
        ...prev[dayOfWeek],
        is_active: !prev[dayOfWeek].is_active
      }
    }))
  }

  const handleTimeChange = (dayOfWeek: number, field: 'start_time' | 'end_time', value: string) => {
    setScheduleData((prev) => ({
      ...prev,
      [dayOfWeek]: {
        ...prev[dayOfWeek],
        [field]: value
      }
    }))
  }

  const handleSave = async () => {
    if (!selectedBarberId) return

    try {
      setSaving(true)
      setError(null)
      setSuccess(false)

      const response = await fetch('/api/admin/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          barber_id: selectedBarberId,
          schedules: Object.entries(scheduleData).map(([dayOfWeek, data]) => ({
            day_of_week: parseInt(dayOfWeek),
            is_working: data.is_active,
            start_time: data.start_time,
            end_time: data.end_time
          }))
        })
      })

      if (!response.ok) {
        throw new Error('Failed to save schedule')
      }

      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      console.error('Error saving schedule:', err)
      setError('Ошибка сохранения расписания')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="p-6 text-center text-[#7c7c7c]">
        Загрузка...
      </div>
    )
  }

  if (barbers.length === 0) {
    return (
      <div className="p-6">
        <h1 className="text-4xl font-bold text-[#f1f1f1] mb-8">Управление расписанием</h1>
        <div className="bg-yellow-900/30 border border-yellow-600 text-yellow-200 px-4 py-3 rounded-lg">
          Барберы не найдены. Сначала добавьте барберов.
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-[#f1f1f1] mb-6">Управление расписанием</h1>

        {/* Barber Selector */}
        <div className="mb-6">
          <label className="block text-[#f1f1f1] font-medium mb-2">Выберите барбера</label>
          <select
            value={selectedBarberId}
            onChange={(e) => setSelectedBarberId(e.target.value)}
            className="w-full md:w-64 px-4 py-2 bg-[#2a2a2a] text-[#f1f1f1] border border-[#404040] rounded-lg focus:border-[#c8a259] focus:ring-1 focus:ring-[#c8a259]"
          >
            {barbers.map((barber) => (
              <option key={barber.id} value={barber.id}>
                {barber.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="bg-red-900/30 border border-red-600 text-red-200 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-900/30 border border-green-600 text-green-200 px-4 py-3 rounded-lg mb-6">
          Расписание сохранено успешно!
        </div>
      )}

      {/* Schedule Grid */}
      <div className="bg-[#2a2a2a] border border-[#404040] rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <div className="min-w-full inline-block align-middle">
            {/* Desktop View */}
            <div className="hidden md:block">
              <div className="bg-[#1a1a1a] border-b border-[#404040] grid grid-cols-7 gap-0">
                {DAYS.map((day) => (
                  <div key={day.number} className="px-4 py-3 border-r border-[#404040] last:border-r-0">
                    <p className="font-semibold text-[#c8a259] text-sm">{day.name}</p>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-0">
                {DAYS.map((day) => (
                  <div
                    key={day.number}
                    className={`px-4 py-6 border-r border-[#404040] last:border-r-0 ${
                      scheduleData[day.number].is_active ? 'bg-green-900/10' : 'bg-gray-900/10'
                    }`}
                  >
                    <div className="space-y-3">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={scheduleData[day.number].is_active}
                          onChange={() => handleDayToggle(day.number)}
                          className="w-4 h-4 rounded border-[#404040] bg-[#1a1a1a] text-[#c8a259]"
                        />
                        <span className="text-sm text-[#f1f1f1]">
                          {scheduleData[day.number].is_active ? 'Работает' : 'Выходной'}
                        </span>
                      </label>

                      {scheduleData[day.number].is_active && (
                        <>
                          <div>
                            <label className="text-xs text-[#7c7c7c] block mb-1">Начало</label>
                            <input
                              type="time"
                              value={scheduleData[day.number].start_time}
                              onChange={(e) => handleTimeChange(day.number, 'start_time', e.target.value)}
                              className="w-full px-2 py-1 text-sm bg-[#1a1a1a] text-[#f1f1f1] border border-[#404040] rounded"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-[#7c7c7c] block mb-1">Конец</label>
                            <input
                              type="time"
                              value={scheduleData[day.number].end_time}
                              onChange={(e) => handleTimeChange(day.number, 'end_time', e.target.value)}
                              className="w-full px-2 py-1 text-sm bg-[#1a1a1a] text-[#f1f1f1] border border-[#404040] rounded"
                            />
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Mobile View */}
            <div className="md:hidden space-y-4 p-4">
              {DAYS.map((day) => (
                <div
                  key={day.number}
                  className={`p-4 rounded-lg border ${
                    scheduleData[day.number].is_active
                      ? 'bg-green-900/10 border-green-600'
                      : 'bg-gray-900/10 border-gray-600'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <p className="font-semibold text-[#f1f1f1]">{day.name}</p>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={scheduleData[day.number].is_active}
                        onChange={() => handleDayToggle(day.number)}
                        className="w-4 h-4 rounded border-[#404040] bg-[#1a1a1a] text-[#c8a259]"
                      />
                      <span className="text-sm text-[#b8b8b8]">
                        {scheduleData[day.number].is_active ? 'Работает' : 'Выходной'}
                      </span>
                    </label>
                  </div>

                  {scheduleData[day.number].is_active && (
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs text-[#7c7c7c] block mb-1">Начало работы</label>
                        <input
                          type="time"
                          value={scheduleData[day.number].start_time}
                          onChange={(e) => handleTimeChange(day.number, 'start_time', e.target.value)}
                          className="w-full px-3 py-2 bg-[#1a1a1a] text-[#f1f1f1] border border-[#404040] rounded"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-[#7c7c7c] block mb-1">Конец работы</label>
                        <input
                          type="time"
                          value={scheduleData[day.number].end_time}
                          onChange={(e) => handleTimeChange(day.number, 'end_time', e.target.value)}
                          className="w-full px-3 py-2 bg-[#1a1a1a] text-[#f1f1f1] border border-[#404040] rounded"
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="mt-8 flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-[#c8a259] hover:bg-[#d4b36d] disabled:opacity-50 text-[#1a1a1a] font-semibold px-8 py-3 rounded-lg transition-colors"
        >
          {saving ? 'Сохранение...' : 'Сохранить расписание'}
        </button>
      </div>
    </div>
  )
}
