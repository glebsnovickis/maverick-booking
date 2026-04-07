export const dynamic = "force-dynamic";

import { createServerClient } from '@/lib/supabase'
import { sendTelegramMessage } from '@/lib/telegram'
import { NextRequest, NextResponse } from 'next/server'
import { DateTime } from 'luxon'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    let date = searchParams.get('date')

    // Default to today if not provided
    if (!date) {
      date = DateTime.now().setZone('Europe/Riga').toISODate()!
    }

    const supabase = createServerClient()

    // Fetch all bookings for the given date with barber and service details
    const { data: bookings, error } = await supabase
      .from('bookings')
      .select(
        `
        id,
        client_name,
        client_phone,
        client_email,
        client_language,
        date,
        start_time,
        end_time,
        status,
        notes,
        created_at,
        confirmed_at,
        cancelled_at,
        barber_id,
        service_id,
        barbers(name, phone, telegram_chat_id),
        services(name_ru, name_lv, price, duration_minutes)
        `
      )
      .eq('date', date)
      .order('start_time', { ascending: true })

    if (error) {
      console.error('Error fetching bookings:', error)
      return NextResponse.json(
        { error: 'Failed to fetch bookings' },
        { status: 500 }
      )
    }

    return NextResponse.json(bookings || [])
  } catch (error) {
    console.error('Error in GET bookings:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, status } = body

    if (!id || !status) {
      return NextResponse.json(
        { error: 'Missing id or status' },
        { status: 400 }
      )
    }

    const validStatuses = ['pending', 'confirmed', 'cancelled', 'completed', 'no_show']
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      )
    }

    const supabase = createServerClient()

    // Prepare update object
    const updateData: any = { status }

    // If confirming, set confirmed_at
    if (status === 'confirmed') {
      updateData.confirmed_at = new Date().toISOString()
    }

    // If cancelling, set cancelled_at
    if (status === 'cancelled') {
      updateData.cancelled_at = new Date().toISOString()
    }

    // Update booking
    const { data: updatedBooking, error: updateError } = await supabase
      .from('bookings')
      .update(updateData)
      .eq('id', id)
      .select(
        `
        id,
        client_name,
        client_phone,
        client_email,
        date,
        start_time,
        end_time,
        status,
        barber_id,
        service_id,
        barbers(name, telegram_chat_id),
        services(name_ru, price)
        `
      )
      .single()

    if (updateError || !updatedBooking) {
      return NextResponse.json(
        { error: 'Failed to update booking' },
        { status: 500 }
      )
    }

    // Send Telegram notification to barber about status change
    const barber = (updatedBooking as any).barbers
    const service = (updatedBooking as any).services

    let notificationText = ''
    if (status === 'confirmed') {
      notificationText = `✅ <b>Запись подтверждена!</b>\n\n👤 ${updatedBooking.client_name}\n📱 ${updatedBooking.client_phone}\n💇 ${service.name_ru}\n📅 ${updatedBooking.date}\n🕐 ${updatedBooking.start_time}`
    } else if (status === 'cancelled') {
      notificationText = `❌ <b>Запись отменена!</b>\n\n👤 ${updatedBooking.client_name}\n📱 ${updatedBooking.client_phone}\n💇 ${service.name_ru}\n📅 ${updatedBooking.date}\n🕐 ${updatedBooking.start_time}`
    } else if (status === 'completed') {
      notificationText = `✔️ <b>Запись завершена!</b>\n\n👤 ${updatedBooking.client_name}\n💇 ${service.name_ru}\n💰 ${service.price}€`
    } else if (status === 'no_show') {
      notificationText = `🚫 <b>Клиент не пришёл!</b>\n\n👤 ${updatedBooking.client_name}\n📱 ${updatedBooking.client_phone}\n📅 ${updatedBooking.date}\n🕐 ${updatedBooking.start_time}`
    }

    if (notificationText && barber?.telegram_chat_id) {
      await sendTelegramMessage(notificationText, barber.telegram_chat_id)
    }

    // TODO: Send notification to client (for now just log)
    console.log(`Notification to client ${updatedBooking.client_phone}: Status changed to ${status}`)

    return NextResponse.json(updatedBooking)
  } catch (error) {
    console.error('Error updating booking:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
