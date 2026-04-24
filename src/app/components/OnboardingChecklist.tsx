'use client'

import Link from 'next/link'

type Props = {
  hasMachines: boolean
  hasAlerts: boolean
  hasReports: boolean
}

function StatusPill({ done }: { done: boolean }) {
  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-medium ${
        done ? 'bg-emerald-900/40 text-emerald-300' : 'bg-amber-900/40 text-amber-300'
      }`}
    >
      {done ? 'Done' : 'To do'}
    </span>
  )
}

export default function OnboardingChecklist({
  hasMachines,
  hasAlerts,
  hasReports,
}: Props) {
  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
      <div className="mb-4">
        <p className="text-sm uppercase tracking-[0.25em] text-blue-400">Onboarding</p>
        <h2 className="mt-2 text-xl font-semibold">Get your workspace ready</h2>
        <p className="mt-2 text-sm text-slate-300">
          Follow these steps to start collecting real fault reports.
        </p>
      </div>

      <div className="space-y-4">
        <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="font-medium text-white">1. Add your machines</p>
              <p className="mt-1 text-sm text-slate-400">
                Create your washers, dryers, dog washes, or other machines.
              </p>
            </div>
            <StatusPill done={hasMachines} />
          </div>

          <div className="mt-4">
            <Link
              href="/setup/machines"
              className="inline-flex rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Go to Machines
            </Link>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="font-medium text-white">2. Add alert recipients</p>
              <p className="mt-1 text-sm text-slate-400">
                Choose who gets emailed when a machine issue is reported.
              </p>
            </div>
            <StatusPill done={hasAlerts} />
          </div>

          <div className="mt-4">
            <Link
              href="/setup/alerts"
              className="inline-flex rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Go to Alerts
            </Link>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="font-medium text-white">3. Generate QR codes</p>
              <p className="mt-1 text-sm text-slate-400">
                Generate machine QR codes so customers can report faults.
              </p>
            </div>
            <StatusPill done={hasMachines} />
          </div>

          <div className="mt-4">
            <Link
              href="/setup/qr-codes"
              className="inline-flex rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Go to QR Codes
            </Link>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="font-medium text-white">4. Review incoming reports</p>
              <p className="mt-1 text-sm text-slate-400">
                Once customers submit issues, manage them from your reports dashboard.
              </p>
            </div>
            <StatusPill done={hasReports} />
          </div>

          <div className="mt-4">
            <Link
              href="/dashboard/reports"
              className="inline-flex rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Go to Reports
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}