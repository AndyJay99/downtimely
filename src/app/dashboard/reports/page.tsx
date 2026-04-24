'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import AppNav from '@/app/components/AppNav'
import { getBusinessId } from '@/lib/getBusinessId'

type Machine = {
  id: string
  name: string
  machine_type: string
}

type FaultReport = {
  id: string
  issue: string
  status: string
  created_at: string
  resolved_at: string | null
  customer_name: string | null
  customer_phone: string | null
  customer_email: string | null
  machines: Machine | Machine[] | null
}

export default function ReportsPage() {
  const [businessId, setBusinessId] = useState('')
  const [reports, setReports] = useState<FaultReport[]>([])
  const [loading, setLoading] = useState(false)
  const [resolvingId, setResolvingId] = useState<string | null>(null)

  useEffect(() => {
    const id = getBusinessId()
    setBusinessId(id)
  }, [])

  useEffect(() => {
    if (!businessId) return

    async function loadReports() {
      setLoading(true)

      try {
        const res = await fetch(
          `/api/fault-reports?businessId=${encodeURIComponent(businessId)}`
        )
        const data = await res.json()
        setReports(data.reports || [])
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    loadReports()
  }, [businessId])

  async function handleResolve(id: string) {
    setResolvingId(id)

    try {
      const res = await fetch(`/api/fault-reports/${id}/resolve`, {
        method: 'POST',
      })

      if (!res.ok) throw new Error()

      setReports((prev) =>
        prev.map((r) =>
          r.id === id
            ? { ...r, status: 'resolved', resolved_at: new Date().toISOString() }
            : r
        )
      )
    } catch (err) {
      console.error(err)
    } finally {
      setResolvingId(null)
    }
  }

  const openCount = useMemo(
    () => reports.filter((r) => r.status !== 'resolved').length,
    [reports]
  )

  const resolvedCount = useMemo(
    () => reports.filter((r) => r.status === 'resolved').length,
    [reports]
  )

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#1e3a8a_0%,_#020617_35%,_#020617_100%)] px-4 py-10 text-white">
      <div className="mx-auto max-w-6xl">
        <AppNav />

        <div className="mb-8">
          <p className="text-sm uppercase tracking-[0.25em] text-blue-300">Reports</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            Fault reports
          </h1>
          <p className="mt-2 text-sm text-slate-300">
            Track issues, contact customers, and resolve downtime quickly.
          </p>
        </div>

        {!businessId ? (
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
            <p className="text-slate-300">
              No business linked yet. Please sign in first.
            </p>
            <Link
              href="/signin"
              className="mt-4 inline-block rounded-xl bg-blue-600 px-4 py-2 text-sm text-white"
            >
              Sign in
            </Link>
          </div>
        ) : (
          <>
            {/* Stats */}
            <div className="mb-6 grid gap-4 md:grid-cols-3">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
                <p className="text-sm text-slate-400">Open</p>
                <p className="mt-2 text-3xl font-semibold">{openCount}</p>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
                <p className="text-sm text-slate-400">Resolved</p>
                <p className="mt-2 text-3xl font-semibold">{resolvedCount}</p>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
                <p className="text-sm text-slate-400">Total</p>
                <p className="mt-2 text-3xl font-semibold">{reports.length}</p>
              </div>
            </div>

            {/* Reports */}
            <div className="space-y-4">
              {loading ? (
                <p className="text-slate-400">Loading...</p>
              ) : reports.length === 0 ? (
                <p className="text-slate-400">No reports yet.</p>
              ) : (
                reports.map((report) => {
                  const machine = Array.isArray(report.machines)
                    ? report.machines[0]
                    : report.machines

                  return (
                    <div
                      key={report.id}
                      className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur"
                    >
                      <div className="flex flex-col gap-4 md:flex-row md:justify-between">
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <h2 className="text-lg font-semibold">
                              {machine?.name || 'Unknown machine'}
                            </h2>

                            <span
                              className={`rounded-full px-3 py-1 text-xs ${
                                report.status === 'resolved'
                                  ? 'bg-green-600/20 text-green-300'
                                  : 'bg-yellow-600/20 text-yellow-300'
                              }`}
                            >
                              {report.status}
                            </span>
                          </div>

                          <p className="text-sm text-slate-400">
                            {new Date(report.created_at).toLocaleString('en-AU')}
                          </p>

                          <div className="rounded-xl bg-black/30 p-4 text-sm text-slate-300">
                            {report.issue}
                          </div>

                          {(report.customer_name ||
                            report.customer_phone ||
                            report.customer_email) && (
                            <div className="rounded-xl bg-black/30 p-4 text-sm">
                              <p className="font-medium text-white">
                                Customer details
                              </p>
                              {report.customer_name && (
                                <p>Name: {report.customer_name}</p>
                              )}
                              {report.customer_phone && (
                                <p>Phone: {report.customer_phone}</p>
                              )}
                              {report.customer_email && (
                                <p>Email: {report.customer_email}</p>
                              )}
                            </div>
                          )}
                        </div>

                        <div className="md:w-40">
                          <button
                            onClick={() => handleResolve(report.id)}
                            disabled={
                              report.status === 'resolved' ||
                              resolvingId === report.id
                            }
                            className="w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                          >
                            {report.status === 'resolved'
                              ? 'Resolved'
                              : resolvingId === report.id
                              ? 'Resolving...'
                              : 'Mark resolved'}
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </>
        )}
      </div>
    </main>
  )
}