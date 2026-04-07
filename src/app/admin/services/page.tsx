'use client'

import { useState, useEffect } from 'react'
import { Service } from '@/lib/types'

interface ServiceForm {
  name_ru: string
  name_lv: string
  price: number
  duration_minutes: number
  description_ru: string
  description_lv: string
}

const emptyForm: ServiceForm = {
  name_ru: '',
  name_lv: '',
  price: 0,
  duration_minutes: 30,
  description_ru: '',
  description_lv: ''
}

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<ServiceForm>(emptyForm)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    fetchServices()
  }, [])

  const fetchServices = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/services')

      if (!response.ok) {
        throw new Error('Failed to fetch services')
      }

      const data = await response.json()
      setServices(data)
      setError(null)
    } catch (err) {
      console.error('Error fetching services:', err)
      setError('Ошибка загрузки услуг')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const method = editingId ? 'PATCH' : 'POST'
      const url = editingId ? `/api/admin/services` : '/api/admin/services'
      const body = editingId
        ? { id: editingId, ...formData }
        : formData

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })

      if (!response.ok) {
        throw new Error('Failed to save service')
      }

      await fetchServices()
      setFormData(emptyForm)
      setEditingId(null)
      setShowForm(false)
      setError(null)
    } catch (err) {
      console.error('Error saving service:', err)
      setError('Ошибка сохранения услуги')
    }
  }

  const handleEdit = (service: Service) => {
    setEditingId(service.id)
    setFormData({
      name_ru: service.name_ru,
      name_lv: service.name_lv,
      price: service.price,
      duration_minutes: service.duration_minutes,
      description_ru: service.description_ru || '',
      description_lv: service.description_lv || ''
    })
    setShowForm(true)
  }

  const handleCancel = () => {
    setFormData(emptyForm)
    setEditingId(null)
    setShowForm(false)
  }

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      const response = await fetch('/api/admin/services', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, is_active: !isActive })
      })

      if (!response.ok) {
        throw new Error('Failed to toggle service')
      }

      await fetchServices()
    } catch (err) {
      console.error('Error toggling service:', err)
      setError('Ошибка обновления услуги')
    }
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold text-[#f1f1f1]">Управление услугами</h1>
        {!showForm && (
          <button
            onClick={() => {
              setFormData(emptyForm)
              setEditingId(null)
              setShowForm(true)
            }}
            className="bg-[#c8a259] hover:bg-[#d4b36d] text-[#1a1a1a] font-semibold px-6 py-2 rounded-lg transition-colors"
          >
            + Добавить услугу
          </button>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-900/30 border border-red-600 text-red-200 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Form */}
      {showForm && (
        <div className="bg-[#2a2a2a] border border-[#404040] rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold text-[#f1f1f1] mb-6">
            {editingId ? 'Редактировать услугу' : 'Добавить новую услугу'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[#f1f1f1] font-medium mb-2">Название (Русский)</label>
                <input
                  type="text"
                  value={formData.name_ru}
                  onChange={(e) => setFormData({ ...formData, name_ru: e.target.value })}
                  required
                  className="w-full px-4 py-2 bg-[#1a1a1a] text-[#f1f1f1] border border-[#404040] rounded-lg focus:border-[#c8a259] focus:ring-1 focus:ring-[#c8a259]"
                />
              </div>
              <div>
                <label className="block text-[#f1f1f1] font-medium mb-2">Название (Латышский)</label>
                <input
                  type="text"
                  value={formData.name_lv}
                  onChange={(e) => setFormData({ ...formData, name_lv: e.target.value })}
                  required
                  className="w-full px-4 py-2 bg-[#1a1a1a] text-[#f1f1f1] border border-[#404040] rounded-lg focus:border-[#c8a259] focus:ring-1 focus:ring-[#c8a259]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[#f1f1f1] font-medium mb-2">Цена (EUR)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                  required
                  className="w-full px-4 py-2 bg-[#1a1a1a] text-[#f1f1f1] border border-[#404040] rounded-lg focus:border-[#c8a259] focus:ring-1 focus:ring-[#c8a259]"
                />
              </div>
              <div>
                <label className="block text-[#f1f1f1] font-medium mb-2">Длительность (минут)</label>
                <input
                  type="number"
                  min="5"
                  step="5"
                  value={formData.duration_minutes}
                  onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) })}
                  required
                  className="w-full px-4 py-2 bg-[#1a1a1a] text-[#f1f1f1] border border-[#404040] rounded-lg focus:border-[#c8a259] focus:ring-1 focus:ring-[#c8a259]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[#f1f1f1] font-medium mb-2">Описание (Русский)</label>
              <textarea
                value={formData.description_ru}
                onChange={(e) => setFormData({ ...formData, description_ru: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 bg-[#1a1a1a] text-[#f1f1f1] border border-[#404040] rounded-lg focus:border-[#c8a259] focus:ring-1 focus:ring-[#c8a259]"
              />
            </div>

            <div>
              <label className="block text-[#f1f1f1] font-medium mb-2">Описание (Латышский)</label>
              <textarea
                value={formData.description_lv}
                onChange={(e) => setFormData({ ...formData, description_lv: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 bg-[#1a1a1a] text-[#f1f1f1] border border-[#404040] rounded-lg focus:border-[#c8a259] focus:ring-1 focus:ring-[#c8a259]"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                className="bg-[#c8a259] hover:bg-[#d4b36d] text-[#1a1a1a] font-semibold px-6 py-2 rounded-lg transition-colors"
              >
                {editingId ? 'Сохранить' : 'Создать'}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="bg-[#404040] hover:bg-[#5e5e5e] text-[#f1f1f1] font-semibold px-6 py-2 rounded-lg transition-colors"
              >
                Отменить
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Services List */}
      {loading ? (
        <div className="text-center text-[#7c7c7c] py-12">
          Загрузка услуг...
        </div>
      ) : services.length === 0 ? (
        <div className="text-center text-[#7c7c7c] py-12">
          Услуги не найдены
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map((service) => (
            <div key={service.id} className="bg-[#2a2a2a] border border-[#404040] rounded-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-[#f1f1f1]">{service.name_ru}</h3>
                  {!service.is_active && (
                    <span className="inline-block mt-1 px-2 py-1 bg-gray-700 text-gray-200 text-xs rounded">
                      Неактивно
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-2 mb-4 text-sm">
                <p className="text-[#b8b8b8]">
                  <span className="text-[#7c7c7c]">Цена:</span> {service.price} EUR
                </p>
                <p className="text-[#b8b8b8]">
                  <span className="text-[#7c7c7c]">Длительность:</span> {service.duration_minutes} мин
                </p>
                {service.description_ru && (
                  <p className="text-[#7c7c7c] text-xs">{service.description_ru}</p>
                )}
              </div>

              <div className="flex gap-2 pt-4 border-t border-[#404040]">
                <button
                  onClick={() => handleEdit(service)}
                  className="flex-1 bg-[#404040] hover:bg-[#5e5e5e] text-[#f1f1f1] font-semibold px-3 py-2 rounded-lg transition-colors text-sm"
                >
                  Редактировать
                </button>
                <button
                  onClick={() => handleToggleActive(service.id, service.is_active)}
                  className={`flex-1 font-semibold px-3 py-2 rounded-lg transition-colors text-sm ${
                    service.is_active
                      ? 'bg-red-600 hover:bg-red-700 text-white'
                      : 'bg-green-600 hover:bg-green-700 text-white'
                  }`}
                >
                  {service.is_active ? 'Деактивировать' : 'Активировать'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
