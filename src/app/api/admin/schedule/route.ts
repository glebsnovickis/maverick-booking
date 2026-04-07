export const dynamic = "force-dynamic";

import { createServerClient } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const barberId = searchParams.get('barber_id')

    if (!barberId) {
      return NextResponse.json(
        { error: 'Missing barber_id parameter' },
        { status: 400 }
      )
    }

    const supabase = createServerClient()

    // Get schedule for a barber (all days)
    const { data: schedule, error } = await supabase
      .from('schedules')
      .select('*')
      .eq('barber_id', barberId)
      .order('day_of_week', { ascending: true })

    if (error) {
      console.error('Error fetching schedule:', error)
      return NextResponse.json(
        { error: 'Failed to fetch schedule' },
        { status: 500 }
      )
    }

    return NextResponse.json(schedule || [])
  } catch (error) {
    console.error('Error in GET schedule:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { barber_id, day_of_week, start_time, end_time, is_working } = body

    // Validate required fields
    if (barber_id === undefined || day_of_week === undefined || !start_time || !end_time) {
      return NextResponse.json(
        { error: 'Missing required fields: barber_id, day_of_week, start_time, end_time' },
        { status: 400 }
      )
    }

    // Validate day_of_week (0-6)
    if (day_of_week < 0 || day_of_week > 6) {
      return NextResponse.json(
        { error: 'day_of_week must be between 0 and 6' },
        { status: 400 }
      )
    }

    const supabase = createServerClient()

    // UPSERT on (barber_id, day_of_week)
    const { data: schedule, error } = await supabase
      .from('schedules')
      .upsert(
        {
          barber_id,
          day_of_week,
          start_time,
          end_time,
          is_working: is_working !== undefined ? is_working : true
        },
        {
          onConflict: 'barber_id,day_of_week'
        }
      )
      .select()
      .single()

    if (error) {
      console.error('Error upserting schedule:', error)
      return NextResponse.json(
        { error: 'Failed to create/update schedule' },
        { status: 500 }
      )
    }

    return NextResponse.json(schedule, { status: 201 })
  } catch (error) {
    console.error('Error in POST schedule:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
