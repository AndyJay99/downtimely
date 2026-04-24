'use client'

import { useEffect, useState } from 'react'
import { QRCodeCanvas } from 'qrcode.react'
import AppNav from '@/app/components/AppNav'
import { getBusinessId } from '@/lib/getBusinessId'

type Machine = {
  id: string
  name: string
  machine_type: string
  qr_slug: string
}

export default function PrintLabelsPage() {
  const [businessId, setBusinessId] = useState('')
  const [machines, setMachines] = useState<Machine[]>([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [origin, setOrigin] = useState('')

  useEffect(() => {
    const id = getBusinessId()
    setBusinessId(id)
    setOrigin(window.location.origin)
  }, [])

  useEffect(() => {
    if (!businessId) return

    async function loadMachines() {
      setLoading(true)
      setMessage('')

      try {
        const res = await fetch(
          `/api/machines?businessId=${encodeURIComponent(businessId)}`
        )

        const text = await res.text()
        let data: { machines?: Machine[]; error?: string } = {}

        try {
          data = JSON.parse(text)
        } catch {
          throw new Error('Server returned non-JSON response.')
        }

        if (!res.ok) {
          throw new Error(data.error || 'Failed to load machines.')
        }

        setMachines(data.machines || [])
      } catch (error) {
        setMessage(error instanceof Error ? error.message : 'Failed to load machines.')
      } finally {
        setLoading(false)
      }
    }

    loadMachines()
  }, [businessId])

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#1e3a8a_0%,_#020617_35%,_#020617_100%)] px-4 py-10 text-white print:bg-white print:px-0 print:py-0 print:text-black">
      <div className="mx-auto max-w-6xl print:max-w-none">
        <div className="no-print">
          <AppNav />
        </div>

        <div className="mb-8 px-0 print:mb-4">
          <p className="text-sm uppercase tracking-[0.25em] text-blue-300 print:text-black">
            Admin
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight print:text-black">
            Print Labels
          </h1>
          <p className="mt-2 text-sm text-slate-300 print:text-black">
            Generate durable machine labels for print production.
          </p>
        </div>

        {!businessId ? (
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur print:hidden">
            <p className="text-slate-300">
              No business linked yet. Please sign in or create an account first.
            </p>
          </div>
        ) : (
          <>
            <div className="mb-6 flex flex-wrap gap-3 no-print">
              <button
                onClick={() => window.print()}
                className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-medium text-white hover:bg-blue-700"
              >
                Print labels
              </button>
            </div>

            {message ? (
              <div className="mb-4 rounded-xl bg-red-900/30 p-3 text-sm text-red-300 no-print">
                {message}
              </div>
            ) : null}

            {loading ? (
              <p className="text-slate-400 print:text-black">Loading machines...</p>
            ) : machines.length === 0 ? (
              <p className="text-slate-400 print:text-black">No machines found.</p>
            ) : (
              <div className="label-grid">
                {machines.map((machine) => {
                  const reportUrl = `${origin}/report/${machine.qr_slug}`

                  return (
                    <div key={machine.id} className="label-card">
                      <div className="label-inner">
                        <p className="label-title">Machine Issue?</p>
                        <p className="label-subtitle">Scan to report a problem</p>

                        <div className="label-qr-wrap">
                          <QRCodeCanvas value={reportUrl} size={150} />
                        </div>

                        <p className="label-machine-name">{machine.name}</p>
                        <p className="label-machine-type">{machine.machine_type}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </>
        )}
      </div>
    </main>
  )
}