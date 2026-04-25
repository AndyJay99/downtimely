import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

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

export async function POST(req: Request) {
  try {
    const resendApiKey = process.env.RESEND_API_KEY

    if (!resendApiKey) {
      return NextResponse.json({ error: 'Missing RESEND_API_KEY.' }, { status: 500 })
    }

    const resend = new Resend(resendApiKey)
    const supabase = getSupabaseAdmin()

    const {
      machineId,
      issue,
      customerName,
      customerPhone,
      customerEmail,
    } = await req.json()

    if (!machineId || !issue) {
      return NextResponse.json(
        { error: 'machineId and issue are required.' },
        { status: 400 }
      )
    }

    // get machine
    const { data: machine, error: machineError } = await supabase
      .from('machines')
      .select('id, name, machine_type, business_id')
      .eq('id', machineId)
      .single()

    if (machineError || !machine) {
      return NextResponse.json(
        { error: machineError?.message || 'Machine not found.' },
        { status: 500 }
      )
    }

    // insert report
    const { error: reportError } = await supabase.from('fault_reports').insert({
      machine_id: machineId,
      business_id: machine.business_id,
      issue,
      status: 'open',
      customer_name: customerName || null,
      customer_phone: customerPhone || null,
      customer_email: customerEmail || null,
    })

    if (reportError) {
      return NextResponse.json(
        { error: `Failed to create report: ${reportError.message}` },
        { status: 500 }
      )
    }

    // get recipients
    const { data: recipients, error: recipientError } = await supabase
      .from('alert_recipients')
      .select('email')
      .eq('business_id', machine.business_id)
      .eq('active', true)

    if (recipientError) {
      return NextResponse.json(
        { error: `Failed to load recipients: ${recipientError.message}` },
        { status: 500 }
      )
    }

    const to = (recipients || []).map((r) => r.email).filter(Boolean)

    if (to.length > 0) {
      const reportedAt = new Date().toLocaleString('en-AU', {
        timeZone: 'Australia/Melbourne',
        dateStyle: 'medium',
        timeStyle: 'short',
      })

      const customerDetailsText =
        customerName || customerPhone || customerEmail
          ? `

Customer details
Name: ${customerName || 'Not provided'}
Phone: ${customerPhone || 'Not provided'}
Email: ${customerEmail || 'Not provided'}`
          : ''

      await resend.emails.send({
        from: 'Downtimely Alerts <alerts@downtimely.co>',
        to,
        subject: `Machine issue reported: ${machine.name}`,
        text: `Machine fault reported

Machine: ${machine.name}
Type: ${machine.machine_type}
Issue: ${issue}
Status: OPEN
Reported: ${reportedAt}${customerDetailsText}`,
        html: `
          <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #111;">
            <h2 style="margin-bottom: 8px;">Machine fault reported</h2>

            <div style="border: 1px solid #eee; border-radius: 8px; padding: 16px;">
              <p><strong>Machine:</strong> ${machine.name}</p>
              <p><strong>Type:</strong> ${machine.machine_type}</p>
              <p><strong>Issue:</strong> ${issue}</p>
              <p><strong>Status:</strong> OPEN</p>
              <p><strong>Reported:</strong> ${reportedAt}</p>
            </div>

            ${
              customerName || customerPhone || customerEmail
                ? `
                <hr style="margin: 20px 0;" />
                <h3>Customer details</h3>
                ${customerName ? `<p><strong>Name:</strong> ${customerName}</p>` : ''}
                ${customerPhone ? `<p><strong>Phone:</strong> ${customerPhone}</p>` : ''}
                ${customerEmail ? `<p><strong>Email:</strong> ${customerEmail}</p>` : ''}
              `
                : ''
            }
          </div>
        `,
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unexpected error' },
      { status: 500 }
    )
  }
}