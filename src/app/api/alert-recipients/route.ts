import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const MAX_RECIPIENTS = 3

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
      .from('alert_recipients')
      .select('id, email, active')
      .eq('business_id', businessId)
      .order('created_at', { ascending: true })

    if (error) {
      return NextResponse.json(
        { error: `Failed to fetch recipients: ${error.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, recipients: data || [] })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unexpected server error.' },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const { businessId, email } = await req.json()

    if (!businessId || !email) {
      return NextResponse.json(
        { error: 'businessId and email are required.' },
        { status: 400 }
      )
    }

    const cleanedEmail = String(email).trim().toLowerCase()
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

    if (!emailRegex.test(cleanedEmail)) {
      return NextResponse.json(
        { error: 'Please enter a valid email address.' },
        { status: 400 }
      )
    }

    const supabaseAdmin = getSupabaseAdmin()

    const { count, error: countError } = await supabaseAdmin
      .from('alert_recipients')
      .select('*', { count: 'exact', head: true })
      .eq('business_id', businessId)

    if (countError) {
      return NextResponse.json(
        { error: `Failed to check recipient limit: ${countError.message}` },
        { status: 500 }
      )
    }

    if ((count ?? 0) >= MAX_RECIPIENTS) {
      return NextResponse.json(
        { error: `You can only add up to ${MAX_RECIPIENTS} alert emails.` },
        { status: 400 }
      )
    }

    const { data: existingRecipient, error: duplicateCheckError } = await supabaseAdmin
      .from('alert_recipients')
      .select('id')
      .eq('business_id', businessId)
      .eq('email', cleanedEmail)
      .maybeSingle()

    if (duplicateCheckError) {
      return NextResponse.json(
        { error: `Failed to check duplicate email: ${duplicateCheckError.message}` },
        { status: 500 }
      )
    }

    if (existingRecipient) {
      return NextResponse.json(
        { error: 'This email is already added.' },
        { status: 400 }
      )
    }

    const { data, error } = await supabaseAdmin
      .from('alert_recipients')
      .insert({
        business_id: businessId,
        email: cleanedEmail,
        active: true,
      })
      .select('id, email, active')
      .single()

    if (error) {
      return NextResponse.json(
        { error: `Failed to add recipient: ${error.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, recipient: data })
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
      return NextResponse.json({ error: 'Recipient id is required.' }, { status: 400 })
    }

    const supabaseAdmin = getSupabaseAdmin()

    const { error } = await supabaseAdmin
      .from('alert_recipients')
      .delete()
      .eq('id', id)

    if (error) {
      return NextResponse.json(
        { error: `Failed to delete recipient: ${error.message}` },
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