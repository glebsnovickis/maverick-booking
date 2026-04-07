'use client'

import { useState, useEffect } from 'react'
import { BookingWithDetails } from '@/lib/types'

type StatusFilter = 'all' | 'pending' | 'confirmed' | 'cancelled' | 'no_show'

export default function BookingsPage() {
  const [bookings, setBookings] = useState<BookingWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')

  useEffect(() => {
    fetchBookings()
  }, [selectedDate, statusFilter])

  const fetchBookings = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/bookings?date=${selectedDate}`)

      if (!response.ok) {
        throw new Error('Failed to fetch bookings')
      }

      const data = await response.json()
      const filtered = statusFilter === 'all' ? data : data.filter((b: BookingWithDetails) => b.status === statusFilter)
      setBookings(filtered)
      setError(null)
    } catch (err) {
      console.error('Error fetching bookings:', err)
      setError('Ошибка загрузки записей')
      setBookings([])
    } finally {
      setLoading(false)
    }
  }

  const handleAction = async (bookingId: string, status: 'confirmed' | 'cancelled' | 'no_show') => {
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

      await fetchBookings()
    } catch (err) {
      console.error('Error updating booking:', err)
      setError('Ошибка обновления записи')
    } finally {
      setActionLoading(null)
    }
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
        <h1 className="text-4xl font-bold text-[#f1f1f1] mb-6">Все записи</h1>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-[#f1f1f1] font-medium mb-2">Дата</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-4 py-2 bg-[#2a2a2a] text-[#f1f1f1] border border-[#404040] rounded-lg focus:border-[#c8a259] focus:ring-1 focus:ring-[#c8a259]"
            />
          </div>

          <div>
            <label className="block text-[#f1f1f1] font-medium mb-2">Статус</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
              className="w-full px-4 py-2 bg-[#2a2a2a] text-[#f1f1f1] border border-[#404040] rounded-lg focus:border-[#c8a259] focus:ring-1 focus:ring-[#c8a259]"
            >
              <option value="all">Все</option>
              <option value="pending">Ожидает подтверждения</option>
              <option value="confirmed">Подтверждена</option>
              <option value="cancelled">Отменена</option>
              <option value="no_show">Не пришел</option>
            </select>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-900/30 border border-red-600 text-red-200 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Bookings List */}
      {loading ? (
        <div className="text-center text-[#7c7c7c] py-12">
          Загрузка записей...
        </div>
      ) : bookings.length === 0 ? (
        <div className="text-center text-[#7c7c7c] py-12">
          Нет записей для выбранной даты и статуса
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block bg-[#2a2a2a] border border-[#404040] rounded-lg overflow-hidden">
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
                        <div className="flex gap-1 flex-wrap">
                          {booking.status !== 'confirmed' && (
                            <button
                              onClick={() => handleAction(booking.id, 'confirmed')}
                              disabled={actionLoading === booking.id}
                              className="px-2 py-1 text-xs bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white rounded transition-colors"
                            >
                              Подтвердить
                            </button>
                          )}
                          {booking.status !== 'cancelled' && (
                            <button
                              onClick={() => handleAction(booking.id, 'cancelled')}
                              disabled={actionLoading === booking.id}
                              className="px-2 py-1 text-xs bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded transition-colors"
                            >
                              Отменить
                            </button>
                          )}
                          {booking.status !== 'no_show' && booking.status !== 'cancelled' && (
                            <button
                              onClick={() => handleAction(booking.id, 'no_show')}
                              disabled={actionLoading === booking.id}
                              className="px-2 py-1 text-xs bg-gray-600 hover:bg-gray-700 disabled:opacity-50 text-white rounded transition-colors"
                            >
                              Не пришел
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-4">
            {bookings.map((booking) => (
              <div key={booking.id} className="bg-[#2a2a2a] border border-[#404040] rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="font-semibold text-[#f1f1f1]">{booking.client_name}</p>
                    <p className="text-sm text-[#7c7c7c]">{booking.start_time}</p>
                  </div>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(booking.status)}`}>
                    {getStatusLabel(booking.status)}
                  </span>
                </div>

                <div className="space-y-2 mb-4 text-sm">
                  <p className="text-[#b8b8b8]">
                    <span className="text-[#7c7c7c]">Телефон:</span> {booking.client_phone}
                  </p>
                  <p className="text-[#b8b8b8]">
                    <span className="text-[#7c7c7c]">Услуга:</span> {booking.service?.name_ru || '-'}
                  </p>
                  <p className="text-[#b8b8b8]">
                    <span className="text-[#7c7c7c]">Барбер:</span> {booking.barber?.name || '-'}
                  </p>
                </div>

                <div className="flex gap-2 flex-wrap">
                  {booking.status !== 'confirmed' && (
                    <button
                      onClick={() => handleAction(booking.id, 'confirmed')}
                      disabled={actionLoading === booking.id}
                      className="px-3 py-1 text-sm bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white rounded transition-colors"
                    >
                      Подтвердить
                    </button>
                  )}
                  {booking.status !== 'cancelled' && (
                    <button
                      onClick={() => handleAction(booking.id, 'cancelled')}
                      disabled={actionLoading === booking.id}
                      className="px-3 py-1 text-sm bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded transition-colors"
                    >
                      Отменить
                    </button>
                  )}
                  {booking.status !== 'no_show' && booking.status !== 'cancelled' && (
                    <button
                      onClick={() => handleAction(booking.id, 'no_show')}
                      disabled={actionLoading === booking.id}
                      className="px-3 py-1 text-sm bg-gray-600 hover:bg-gray-700 disabled:opacity-50 text-white rounded transition-colors"
                    >
                      Не пришел
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
