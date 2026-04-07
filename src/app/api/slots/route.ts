export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const revalidate = 0;

import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { DateTime } from 'luxon'

// Create a fresh Supabase client with no caching for each request
function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        fetch: (url, options = {}) => {
          return fetch(url, { ...options, cache: 'no-store' })
        }
      }
    }
  )
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date')
    const barberId = searchParams.get('barber_id')
    const serviceId = searchParams.get('service_id')

    // Validate parameters
    if (!date || !barberId || !serviceId) {
      return NextResponse.json(
        { error: 'Missing required parameters: date, barber_id, service_id' },
        { status: 400 }
      )
    }

    const supabase = getSupabase()

    // 1. Get the service to know duration_minutes
    const { data: service, error: serviceError } = await supabase
      .from('services')
      .select('duration_minutes')
      .eq('id', serviceId)
      .single()

    if (serviceError || !service) {
      console.error('Service error:', serviceError)
      return NextResponse.json(
        { error: 'Service not found' },
        { status: 404 }
      )
    }

    // 2. Get the barber's schedule for that day_of_week
    const dt = DateTime.fromISO(date, { zone: 'Europe/Riga' })
    const dayOfWeek = dt.weekday % 7 // Luxon uses 1-7 (Mon-Sun), convert to 0-6 (Sun-Sat) for DB

    const { data: schedule, error: scheduleError } = await supabase
      .from('schedules')
      .select('start_time, end_time, is_working')
      .eq('barber_id', barberId)
      .eq('day_of_week', dayOfWeek)
      .single()

    if (scheduleError) {
      console.error('Schedule error:', scheduleError)
    }

    // 3. Check schedule_exceptions for that specific date
    const { data: exception } = await supabase
      .from('schedule_exceptions')
      .select('*')
      .eq('barber_id', barberId)
      .eq('date', date)
      .single()

    // If barber doesn't work that day, return empty array
    if (!schedule || !schedule.is_working) {
      return NextResponse.json([])
    }

    // Handle exception overrides
    let startTime = schedule.start_time
    let endTime = schedule.end_time

    if (exception) {
      if (!exception.is_working) {
        return NextResponse.json([])
      }
      if (exception.start_time) startTime = exception.start_time
      if (exception.end_time) endTime = exception.end_time
    }

    // 4. Get existing bookings for that barber on that date (not cancelled)
    const { data: bookings, error: bookingsError } = await supabase
      .from('bookings')
      .select('start_time, end_time')
      .eq('barber_id', barberId)
      .eq('date', date)
      .neq('status', 'cancelled')

    console.log('Slots API debug:', JSON.stringify({
      date, barberId,
      bookingsCount: bookings?.length ?? 'null',
      bookingsError: bookingsError?.message ?? 'none',
      bookings
    }))

    // 5. Generate all possible time slots
    const slots = generateTimeSlots(
      startTime,
      endTime,
      service.duration_minutes,
      date,
      bookings || [],
      dt
    )

    // Return with explicit no-cache headers
    return NextResponse.json(slots, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
        'Pragma': 'no-cache',
      }
    })
  } catch (error) {
    console.error('Error fetching slots:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

function generateTimeSlots(
  startTimeStr: string,
  endTimeStr: string,
  durationMinutes: number,
  dateStr: string,
  bookings: Array<{ start_time: string; end_time: string }>,
  dateTime: any
) {
  const slots = []
  const [startHour, startMinute] = startTimeStr.split(':').map(Number)
  const [endHour, endMinute] = endTimeStr.split(':').map(Number)

  const startTotalMinutes = startHour * 60 + startMinute
  const endTotalMinutes = endHour * 60 + endMinute

  // Current time for past slot filtering
  const now = DateTime.now().setZone('Europe/Riga')
  const isToday = dateTime.hasSame(now, 'day')

  for (
    let currentMinutes = startTotalMinutes;
    currentMinutes + durationMinutes <= endTotalMinutes;
    currentMinutes += durationMinutes
  ) {
    const hours = Math.floor(currentMinutes / 60)
    const minutes = currentMinutes % 60
    const slotTime = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`

    // 6. Filter out slots that are in the past (2 hours lead time)
    if (isToday) {
      const slotDateTime = DateTime.fromISO(`${dateStr}T${slotTime}`, { zone: 'Europe/Riga' })
      const twoHoursFromNow = now.plus({ hours: 2 })
      if (slotDateTime < twoHoursFromNow) {
        continue
      }
    }

    // 7. Check if slot overlaps with existing bookings
    const overlaps = bookings.some((booking) => {
      const bookingStart = timeToMinutes(booking.start_time)
      const bookingEnd = timeToMinutes(booking.end_time)
      const slotStart = currentMinutes
      const slotEnd = currentMinutes + durationMinutes

      return slotStart < bookingEnd && slotEnd > bookingStart
    })

    slots.push({
      time: slotTime,
      available: !overlaps
    })
  }

  return slots
}

function timeToMinutes(timeStr: string): number {
  const [hours, minutes] = timeStr.split(':').map(Number)
  return hours * 60 + minutes
}
