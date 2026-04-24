import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

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

    const supabase = getSupabaseAdmin()

    const [{ count: machineCount, error: machineError }, { count: alertCount, error: alertError }, { count: reportCount, error: reportError }] =
      await Promise.all([
        supabase
          .from('machines')
          .select('*', { count: 'exact', head: true })
          .eq('business_id', businessId),

        supabase
          .from('alert_recipients')
          .select('*', { count: 'exact', head: true })
          .eq('business_id', businessId)
          .eq('active', true),

        supabase
          .from('fault_reports')
          .select('*', { count: 'exact', head: true })
          .eq('business_id', businessId),
      ])

    if (machineError) {
      return NextResponse.json(
        { error: `Failed to count machines: ${machineError.message}` },
        { status: 500 }
      )
    }

    if (alertError) {
      return NextResponse.json(
        { error: `Failed to count alert recipients: ${alertError.message}` },
        { status: 500 }
      )
    }

    if (reportError) {
      return NextResponse.json(
        { error: `Failed to count reports: ${reportError.message}` },
        { status: 500 }
      )
    }

    const status = {
      hasMachines: (machineCount || 0) > 0,
      hasAlerts: (alertCount || 0) > 0,
      hasReports: (reportCount || 0) > 0,
      machineCount: machineCount || 0,
      alertCount: alertCount || 0,
      reportCount: reportCount || 0,
    }

    return NextResponse.json({ success: true, status })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unexpected server error.' },
      { status: 500 }
    )
  }
}