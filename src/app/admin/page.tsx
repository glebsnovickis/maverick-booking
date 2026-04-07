'use client'

import { useState, useEffect } from 'react'
import { BookingWithDetails } from '@/lib/types'

export default function DashboardPage() {
  const [bookings, setBookings] = useState<BookingWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => {
    fetchTodayBookings()
  }, [])

  const fetchTodayBookings = async () => {
    try {
      setLoading(true)
      const today = new Date().toISOString().split('T')[0]
      const response = await fetch(`/api/admin/bookings?date=${today}`)

      if (!response.ok) {
        throw new Error('Failed to fetch bookings')
      }

      const data = await response.json()
      setBookings(data)
      setError(null)
    } catch (err) {
      console.error('Error fetching bookings:', err)
      setError('Ошибка загрузки записей')
      setBookings([])
    } finally {
      setLoading(false)
    }
  }

  const handleAction = async (bookingId: string, status: 'confirmed' | 'cancelled') => {
    try {
      setActionLoading(bookingId)

      const response = await fetch(`/api/admin/bookings`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: bookingId, status })
      })

      if (!response.ok) {
        throw new Error('Failed to update booking')
      }

      await fetchTodayBookings()
    } catch (err) {
      console.error('Error updating booking:', err)
      setError('Ошибка обновления записи')
    } finally {
      setActionLoading(null)
    }
  }

  const today = new Date()
  const dateStr = today.toLocaleDateString('ru-RU', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  const stats = {
    total: bookings.length,
    confirmed: bookings.filter((b) => b.status === 'confirmed').length,
    pending: bookings.filter((b) => b.status === 'pending').length
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-900 text-green-100'
      case 'pending':
        return 'bg-yellow-900 text-yellow-100'
      case 'cancelled':
        return 'bg-red-900 text-red-100'
      case 'no_show':
        return 'bg-gray-600 text-gray-100'
      default:
        return 'bg-[#404040] text-[#f1f1f1]'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'Подтверждена'
      case 'pending':
        return 'Ожидает'
      case 'cancelled':
        return 'Отменена'
      case 'no_show':
        return 'Не пришел'
      default:
        return status
    }
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-[#f1f1f1] mb-2">Панель управления</h1>
        <p className="text-[#c8a259] text-lg capitalize">{dateStr}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-[#2a2a2a] border border-[#404040] rounded-lg p-6">
          <p className="text-[#7c7c7c] text-sm mb-2">Всего записей</p>
          <p className="text-3xl font-bold text-[#c8a259]">{stats.total}</p>
        </div>
        <div className="bg-[#2a2a2a] border border-[#404040] rounded-lg p-6">
          <p className="text-[#7c7c7c] text-sm mb-2">Подтверждено</p>
          <p className="text-3xl font-bold text-green-400">{stats.confirmed}</p>
        </div>
        <div className="bg-[#2a2a2a] border border-[#404040] rounded-lg p-6">
          <p className="text-[#7c7c7c] text-sm mb-2">Ожидает подтверждения</p>
          <p className="text-3xl font-bold text-yellow-400">{stats.pending}</p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-900/30 border border-red-600 text-red-200 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Bookings Section */}
      <div className="bg-[#2a2a2a] border border-[#404040] rounded-lg overflow-hidden">
        <div className="border-b border-[#404040] px-6 py-4">
          <h2 className="text-xl font-semibold text-[#f1f1f1]">Записи на сегодня</h2>
        </div>

        {loading ? (
          <div className="p-8 text-center text-[#7c7c7c]">
            Загрузка записей...
          </div>
        ) : bookings.length === 0 ? (
          <div className="p-8 text-center text-[#7c7c7c]">
            Нет записей на сегодня
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-[#1a1a1a] border-b border-[#404040]">
                  <th className="px-6 py-3 text-left text-[#7c7c7c] font-semibold text-sm">Время</th>
                  <th className="px-6 py-3 text-left text-[#7c7c7c] font-semibold text-sm">Клиент</th>
                  <th className="px-6 py-3 text-left text-[#7c7c7c] font-semibold text-sm">Телефон</th>
                  <th className="px-6 py-3 text-left text-[#7c7c7c] font-semibold text-sm">Услуга</th>
                  <th className="px-6 py-3 text-left text-[#7c7c7c] font-semibold text-sm">Барбер</th>
                  <th className="px-6 py-3 text-left text-[#7c7c7c] font-semibold text-sm">Статус</th>
                  <th className="px-6 py-3 text-left text-[#7c7c7c] font-semibold text-sm">Действия</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking) => (
                  <tr key={booking.id} className="border-b border-[#404040] hover:bg-[#1a1a1a] transition-colors">
                    <td className="px-6 py-4 text-[#f1f1f1]">{booking.start_time}</td>
                    <td className="px-6 py-4 text-[#f1f1f1]">{booking.client_name}</td>
                    <td className="px-6 py-4 text-[#b8b8b8]">{booking.client_phone}</td>
                    <td className="px-6 py-4 text-[#b8b8b8]">{booking.service?.name_ru || '-'}</td>
                    <td className="px-6 py-4 text-[#b8b8b8]">{booking.barber?.name || '-'}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(booking.status)}`}>
                        {getStatusLabel(booking.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {booking.status === 'pending' && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleAction(booking.id, 'confirmed')}
                            disabled={actionLoading === booking.id}
                            className="px-3 py-1 text-sm bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white rounded transition-colors"
                          >
                            {actionLoading === booking.id ? '...' : 'Подтвердить'}
                          </button>
                          <button
                            onClick={() => handleAction(booking.id, 'cancelled')}
                            disabled={actionLoading === booking.id}
                            className="px-3 py-1 text-sm bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded transition-colors"
                          >
                            {actionLoading === booking.id ? '...' : 'Отменить'}
                          </button>
                        </div>
                      )}
                      {booking.status !== 'pending' && (
                        <span className="text-[#7c7c7c] text-sm">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
