'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import AppNav from '@/app/components/AppNav'
import OnboardingChecklist from '@/app/components/OnboardingChecklist'
import { getBusinessId } from '@/lib/getBusinessId'

type Report = {
  id: string
  status: string
}

type Machine = {
  id: string
}

type OnboardingStatus = {
  hasMachines: boolean
  hasAlerts: boolean
  hasReports: boolean
  machineCount: number
  alertCount: number
  reportCount: number
}

export default function DashboardHomePage() {
  const [businessId, setBusinessId] = useState('')
  const [reportCount, setReportCount] = useState(0)
  const [openCount, setOpenCount] = useState(0)
  const [machineCount, setMachineCount] = useState(0)
  const [status, setStatus] = useState<OnboardingStatus | null>(null)

  useEffect(() => {
    const id = getBusinessId()
    setBusinessId(id)
  }, [])

  useEffect(() => {
    if (!businessId) return

    async function loadDashboard() {
      try {
        const reportsRes = await fetch(
          `/api/fault-reports?businessId=${encodeURIComponent(businessId)}`
        )
        const reportsData = await reportsRes.json()

        const machinesRes = await fetch(
          `/api/machines?businessId=${encodeURIComponent(businessId)}`
        )
        const machinesData = await machinesRes.json()

        const onboardingRes = await fetch(
          `/api/onboarding-status?businessId=${encodeURIComponent(businessId)}`
        )
        const onboardingData = await onboardingRes.json()

        const reports: Report[] = reportsData.reports || []
        const machines: Machine[] = machinesData.machines || []

        setReportCount(reports.length)
        setOpenCount(reports.filter((r) => r.status !== 'resolved').length)
        setMachineCount(machines.length)
        setStatus(onboardingData.status || null)
      } catch (error) {
        console.error(error)
      }
    }

    loadDashboard()
  }, [businessId])

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#1e3a8a_0%,_#020617_35%,_#020617_100%)] px-4 py-10 text-white">
      <div className="mx-auto max-w-6xl">
        <AppNav />

        <div className="mb-8">
          <p className="text-sm uppercase tracking-[0.25em] text-blue-300">Dashboard</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">Welcome back</h1>
          <p className="mt-2 text-sm text-slate-300">
            Manage machines, alerts, QR codes and fault reports from one place.
          </p>
        </div>

        {!businessId ? (
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
            <p className="text-slate-300">
              No business linked yet. Please sign in or create an account first.
            </p>

            <div className="mt-4 flex gap-3">
              <Link
                href="/signin"
                className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                Sign in
              </Link>

              <Link
                href="/signup"
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-100 hover:bg-white/10"
              >
                Create account
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
                <p className="text-sm text-slate-400">Machines</p>
                <p className="mt-3 text-3xl font-semibold">{machineCount}</p>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
                <p className="text-sm text-slate-400">Open reports</p>
                <p className="mt-3 text-3xl font-semibold">{openCount}</p>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
                <p className="text-sm text-slate-400">Total reports</p>
                <p className="mt-3 text-3xl font-semibold">{reportCount}</p>
              </div>
            </div>

            <div className="mt-8 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
              <div>
                {status ? (
                  <OnboardingChecklist
                    hasMachines={status.hasMachines}
                    hasAlerts={status.hasAlerts}
                    hasReports={status.hasReports}
                  />
                ) : (
                  <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
                    <p className="text-slate-400">Loading onboarding status...</p>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <Link
                  href="/setup/machines"
                  className="block rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur transition hover:bg-white/10"
                >
                  <h2 className="text-lg font-semibold">Manage machines</h2>
                  <p className="mt-2 text-sm text-slate-300">
                    Add machines and control your reporting setup.
                  </p>
                </Link>

                <Link
                  href="/setup/alerts"
                  className="block rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur transition hover:bg-white/10"
                >
                  <h2 className="text-lg font-semibold">Alert recipients</h2>
                  <p className="mt-2 text-sm text-slate-300">
                    Control who gets notified when a customer reports an issue.
                  </p>
                </Link>

                <Link
                  href="/setup/qr-codes"
                  className="block rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur transition hover:bg-white/10"
                >
                  <h2 className="text-lg font-semibold">QR codes</h2>
                  <p className="mt-2 text-sm text-slate-300">
                    Generate QR codes for each machine.
                  </p>
                </Link>

                <Link
                  href="/dashboard/reports"
                  className="block rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur transition hover:bg-white/10"
                >
                  <h2 className="text-lg font-semibold">View reports</h2>
                  <p className="mt-2 text-sm text-slate-300">
                    Review open issues and resolve them quickly.
                  </p>
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  )
}