import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      'Missing Supabase environment variables. Check NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.'
    )
  }

  return createClient(supabaseUrl, serviceRoleKey)
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const businessId = searchParams.get('businessId')

    if (!businessId) {
      return NextResponse.json({ error: 'businessId is required.' }, { status: 400 })
    }

    const supabaseAdmin = getSupabaseAdmin()

    const { data, error } = await supabaseAdmin
      .from('machines')
      .select('id, name, machine_type, qr_slug, active')
      .eq('business_id', businessId)
      .order('created_at', { ascending: true })

    if (error) {
      return NextResponse.json(
        { error: `Failed to fetch machines: ${error.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, machines: data || [] })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unexpected server error.' },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { businessId, name, machineType } = body as {
      businessId?: string
      name?: string
      machineType?: string
    }

    if (!businessId || !name || !machineType) {
      return NextResponse.json(
        { error: 'businessId, name, and machineType are required.' },
        { status: 400 }
      )
    }

    const supabaseAdmin = getSupabaseAdmin()
    const qrSlug = slugify(name)

    const { data, error } = await supabaseAdmin
      .from('machines')
      .insert({
        business_id: businessId,
        name,
        machine_type: machineType,
        qr_slug: qrSlug,
        active: true,
      })
      .select('id, name, machine_type, qr_slug, active')
      .single()

    if (error) {
      return NextResponse.json(
        { error: `Failed to create machine: ${error.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, machine: data })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unexpected server error.' },
      { status: 500 }
    )
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json()
    const { id, name } = body as {
      id?: string
      name?: string
    }

    if (!id || !name) {
      return NextResponse.json(
        { error: 'Machine id and name are required.' },
        { status: 400 }
      )
    }

    const supabaseAdmin = getSupabaseAdmin()
    const qrSlug = slugify(name)

    const { data, error } = await supabaseAdmin
      .from('machines')
      .update({
        name,
        qr_slug: qrSlug,
      })
      .eq('id', id)
      .select('id, name, machine_type, qr_slug, active')
      .single()

    if (error) {
      return NextResponse.json(
        { error: `Failed to update machine: ${error.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, machine: data })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unexpected server error.' },
      { status: 500 }
    )
  }
}

export async function DELETE(req: Request) {
  try {
    const { id } = await req.json()

    if (!id) {
      return NextResponse.json({ error: 'Machine id is required.' }, { status: 400 })
    }

    const supabaseAdmin = getSupabaseAdmin()

    const { error } = await supabaseAdmin
      .from('machines')
      .delete()
      .eq('id', id)

    if (error) {
      return NextResponse.json(
        { error: `Failed to delete machine: ${error.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unexpected server error.' },
      { status: 500 }
    )
  }
}