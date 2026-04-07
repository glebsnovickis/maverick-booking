export const dynamic = "force-dynamic";

import { createServerClient } from '@/lib/supabase'
import { sendTelegramMessage, formatBookingNotification } from '@/lib/telegram'
import { NextRequest, NextResponse } from 'next/server'
// luxon available if needed for timezone ops

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      barber_id,
      service_id,
      date,
      start_time,
      client_name,
      client_phone,
      client_email,
      client_language
    } = body

    // 1. Validate all required fields
    if (!barber_id || !service_id || !date || !start_time || !client_name || !client_phone) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const supabase = createServerClient()

    // Get service duration
    const { data: service, error: serviceError } = await supabase
      .from('services')
      .select('duration_minutes, name_ru')
      .eq('id', service_id)
      .single()

    if (serviceError || !service) {
      return NextResponse.json(
        { error: 'Service not found' },
        { status: 404 }
      )
    }

    // Get barber info
    const { data: barber, error: barberError } = await supabase
      .from('barbers')
      .select('name, telegram_chat_id')
      .eq('id', barber_id)
      .single()

    if (barberError || !barber) {
      return NextResponse.json(
        { error: 'Barber not found' },
        { status: 404 }
      )
    }

    // 2. Calculate end_time
    const [hours, minutes] = start_time.split(':').map(Number)
    const totalMinutes = hours * 60 + minutes + service.duration_minutes
    const endHours = Math.floor(totalMinutes / 60)
    const endMinutes = totalMinutes % 60
    const end_time = `${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}`

    // 3. Check the slot is still available
    const { data: conflictingBookings } = await supabase
      .from('bookings')
      .select('*')
      .eq('barber_id', barber_id)
      .eq('date', date)
      .neq('status', 'cancelled')

    const slotStart = timeToMinutes(start_time)
    const slotEnd = timeToMinutes(end_time)

    const hasConflict = conflictingBookings?.some((booking) => {
      const bookingStart = timeToMinutes(booking.start_time)
      const bookingEnd = timeToMinutes(booking.end_time)
      return slotStart < bookingEnd && slotEnd > bookingStart
    })

    if (hasConflict) {
      return NextResponse.json(
        { error: 'Slot is no longer available' },
        { status: 409 }
      )
    }

    // 4. Insert into bookings table
    const { data: booking, error: insertError } = await supabase
      .from('bookings')
      .insert({
        barber_id,
        service_id,
        date,
        start_time,
        end_time,
        client_name,
        client_phone,
        client_email,
        client_language: client_language || 'ru',
        status: 'pending'
      })
      .select()
      .single()

    if (insertError || !booking) {
      return NextResponse.json(
        { error: 'Failed to create booking' },
        { status: 500 }
      )
    }

    // 5. Send Telegram notification to barber
    const notificationText = formatBookingNotification({
      client_name,
      client_phone,
      service_name: service.name_ru,
      barber_name: barber.name,
      date,
      start_time,
      status: 'Ожидает подтверждения'
    })

    await sendTelegramMessage(notificationText, barber.telegram_chat_id)

    // 6. Return the created booking with 201
    return NextResponse.json(booking, { status: 201 })
  } catch (error) {
    console.error('Error creating booking:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json(
        { error: 'Missing cancel token' },
        { status: 400 }
      )
    }

    const supabase = createServerClient()

    // 1. Find booking by cancel_token
    const { data: booking, error: fetchError } = await supabase
      .from('bookings')
      .select('*')
      .eq('cancel_token', token)
      .single()

    // 2. If not found or already cancelled, return 404
    if (fetchError || !booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }

    if (booking.status === 'cancelled') {
      return NextResponse.json(
        { error: 'Booking is already cancelled' },
        { status: 400 }
      )
    }

    // 3. Update status to 'cancelled'
    const { data: updatedBooking, error: updateError } = await supabase
      .from('bookings')
      .update({
        status: 'cancelled',
        cancelled_at: new Date().toISOString()
      })
      .eq('id', booking.id)
      .select()
      .single()

    if (updateError || !updatedBooking) {
      return NextResponse.json(
        { error: 'Failed to cancel booking' },
        { status: 500 }
      )
    }

    // 4. Send Telegram notification about cancellation
    const { data: barber } = await supabase
      .from('barbers')
      .select('name, telegram_chat_id')
      .eq('id', booking.barber_id)
      .single()

    const { data: service } = await supabase
      .from('services')
      .select('name_ru')
      .eq('id', booking.service_id)
      .single()

    const cancellationText = `❌ <b>Отмена записи!</b>\n\n👤 ${booking.client_name}\n📱 ${booking.client_phone}\n💇 ${service?.name_ru || 'Услуга'}\n📅 ${booking.date}\n🕐 ${booking.start_time}`

    if (barber?.telegram_chat_id) {
      await sendTelegramMessage(cancellationText, barber.telegram_chat_id)
    }

    // 5. Return success
    return NextResponse.json(updatedBooking)
  } catch (error) {
    console.error('Error cancelling booking:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

function timeToMinutes(timeStr: string): number {
  const [hours, minutes] = timeStr.split(':').map(Number)
  return hours * 60 + minutes
}
