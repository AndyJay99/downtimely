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

export async function POST(req: Request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        {
          error:
            'Missing Supabase environment variables. Check NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.',
        },
        { status: 500 }
      )
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey)

    const body = await req.json()
    const { businessName, email, password } = body as {
      businessName?: string
      email?: string
      password?: string
    }

    if (!businessName || !email || !password) {
      return NextResponse.json(
        { error: 'Business name, email, and password are required.' },
        { status: 400 }
      )
    }

    const slug = slugify(businessName)

    const { data: existingBusiness, error: existingBusinessError } = await supabaseAdmin
      .from('businesses')
      .select('id')
      .eq('slug', slug)
      .maybeSingle()

    if (existingBusinessError) {
      console.error('Existing business lookup error:', existingBusinessError)
      return NextResponse.json(
        {
          error: `Failed to check existing business: ${existingBusinessError.message}`,
        },
        { status: 500 }
      )
    }

    if (existingBusiness) {
      return NextResponse.json(
        { error: 'A business with that name already exists.' },
        { status: 400 }
      )
    }

    const { data: business, error: businessError } = await supabaseAdmin
      .from('businesses')
      .insert({
        name: businessName,
        slug,
        contact_email: email,
      })
      .select()
      .single()

    if (businessError) {
      console.error('Business insert error:', businessError)
      return NextResponse.json(
        { error: `Failed to create business: ${businessError.message}` },
        { status: 500 }
      )
    }

    const { error: userError } = await supabaseAdmin.from('users').insert({
      business_id: business.id,
      full_name: '',
      email,
      role: 'owner',
    })

    if (userError) {
      console.error('User insert error:', userError)
      return NextResponse.json(
        { error: `Business created, but failed to create owner user: ${userError.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Account created successfully.',
      businessId: business.id,
      businessSlug: business.slug,
    })
  } catch (error) {
    console.error('Signup API error:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Unexpected server error.',
      },
      { status: 500 }
    )
  }
}