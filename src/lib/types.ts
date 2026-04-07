export interface Barber {
  id: string
  name: string
  name_lv?: string
  photo_url?: string
  bio_ru?: string
  bio_lv?: string
  phone?: string
  telegram_chat_id?: string
  is_active: boolean
  created_at: string
}

export interface Service {
  id: string
  name_ru: string
  name_lv: string
  description_ru?: string
  description_lv?: string
  duration_minutes: number
  price: number
  is_active: boolean
  sort_order: number
  created_at: string
}

export interface Schedule {
  id: string
  barber_id: string
  day_of_week: number // 1-5 (Mon-Fri in our DB)
  start_time: string // HH:MM format
  end_time: string // HH:MM format
  is_working: boolean
}

export interface ScheduleException {
  id: string
  barber_id: string
  date: string // YYYY-MM-DD format
  is_working: boolean
  start_time?: string
  end_time?: string
  reason?: string
}

export interface Booking {
  id: string
  barber_id: string
  service_id: string
  client_name: string
  client_phone: string
  client_email?: string
  client_language: 'ru' | 'lv'
  date: string // YYYY-MM-DD format
  start_time: string // HH:MM format
  end_time: string // HH:MM format
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show'
  cancel_token: string
  notes?: string
  created_at: string
  confirmed_at?: string
  cancelled_at?: string
}

export interface Settings {
  key: string
  value: string
  updated_at: string
}

// Extended types with relations
export interface BookingWithDetails extends Booking {
  service?: Service
  barber?: Barber
}

export interface BarberWithSchedule extends Barber {
  schedule?: Schedule[]
  exceptions?: ScheduleException[]
}
