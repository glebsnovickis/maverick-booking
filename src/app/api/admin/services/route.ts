export const dynamic = "force-dynamic";

import { createServerClient } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(_request: NextRequest) {
  try {
    const supabase = createServerClient()

    // List all services (including inactive)
    const { data: services, error } = await supabase
      .from('services')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching services:', error)
      return NextResponse.json(
        { error: 'Failed to fetch services' },
        { status: 500 }
      )
    }

    return NextResponse.json(services || [])
  } catch (error) {
    console.error('Error in GET services:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name_ru, name_lv, description_ru, description_lv, price, duration_minutes, sort_order } = body

    // Validate required fields
    if (!name_ru || !name_lv || !price || !duration_minutes) {
      return NextResponse.json(
        { error: 'Missing required fields: name_ru, name_lv, price, duration_minutes' },
        { status: 400 }
      )
    }

    const supabase = createServerClient()

    const { data: service, error } = await supabase
      .from('services')
      .insert({
        name_ru,
        name_lv,
        description_ru,
        description_lv,
        price: parseFloat(price),
        duration_minutes: parseInt(duration_minutes),
        sort_order: sort_order || 0,
        is_active: true
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating service:', error)
      return NextResponse.json(
        { error: 'Failed to create service' },
        { status: 500 }
      )
    }

    return NextResponse.json(service, { status: 201 })
  } catch (error) {
    console.error('Error in POST service:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, name_ru, name_lv, description_ru, description_lv, price, duration_minutes, sort_order, is_active } = body

    if (!id) {
      return NextResponse.json(
        { error: 'Missing service id' },
        { status: 400 }
      )
    }

    const supabase = createServerClient()

    // Build update object with only provided fields
    const updateData: any = {}
    if (name_ru !== undefined) updateData.name_ru = name_ru
    if (name_lv !== undefined) updateData.name_lv = name_lv
    if (description_ru !== undefined) updateData.description_ru = description_ru
    if (description_lv !== undefined) updateData.description_lv = description_lv
    if (price !== undefined) updateData.price = parseFloat(price)
    if (duration_minutes !== undefined) updateData.duration_minutes = parseInt(duration_minutes)
    if (sort_order !== undefined) updateData.sort_order = sort_order
    if (is_active !== undefined) updateData.is_active = is_active

    const { data: service, error } = await supabase
      .from('services')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error || !service) {
      console.error('Error updating service:', error)
      return NextResponse.json(
        { error: 'Failed to update service' },
        { status: 500 }
      )
    }

    return NextResponse.json(service)
  } catch (error) {
    console.error('Error in PATCH service:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Missing service id' },
        { status: 400 }
      )
    }

    const supabase = createServerClient()

    // Soft delete (set is_active=false)
    const { data: service, error } = await supabase
      .from('services')
      .update({ is_active: false })
      .eq('id', id)
      .select()
      .single()

    if (error || !service) {
      console.error('Error deleting service:', error)
      return NextResponse.json(
        { error: 'Failed to delete service' },
        { status: 500 }
      )
    }

    return NextResponse.json(service)
  } catch (error) {
    console.error('Error in DELETE service:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
