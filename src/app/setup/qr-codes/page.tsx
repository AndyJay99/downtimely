'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { QRCodeCanvas } from 'qrcode.react'
import { getBusinessId } from '@/lib/getBusinessId'

type Machine = {
  id: string
  name: string
  machine_type: string
  qr_slug: string
  active: boolean
}

export default function QRCodesPage() {
  const [businessId, setBusinessId] = useState('')
  const [machines, setMachines] = useState<Machine[]>([])
  const [message, setMessage] = useState('')
  const [isError, setIsError] = useState(false)
  const [fetching, setFetching] = useState(false)
  const [origin, setOrigin] = useState('')

  useEffect(() => {
    const id = getBusinessId()
    setBusinessId(id)
    setOrigin(window.location.origin)
  }, [])

  useEffect(() => {
    if (!businessId) return

    async function loadMachines() {
      setFetching(true)
      setMessage('')
      setIsError(false)

      try {
        const res = await fetch(
          `/api/machines?businessId=${encodeURIComponent(businessId)}`
        )

        const text = await res.text()
        let data: { error?: string; machines?: Machine[] } = {}

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
        setIsError(true)
        setMessage(error instanceof Error ? error.message : 'Failed to load machines.')
      } finally {
        setFetching(false)
      }
    }

    loadMachines()
  }, [businessId])

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-10 text-white">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-blue-400">Downtimely</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">QR Codes</h1>
            <p className="mt-2 text-sm text-slate-300">
              Generate QR codes for each machine.
            </p>
          </div>

          <Link href="/" className="text-sm text-slate-400 hover:text-white">
            ← Home
          </Link>
        </div>

        {!businessId ? (
          <p className="mt-6 text-slate-400">
            No business linked yet. Please create an account first.
          </p>
        ) : (
          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
            {message ? (
              <div
                className={`mb-4 rounded-xl p-3 text-sm ${
                  isError
                    ? 'bg-red-900/30 text-red-300'
                    : 'bg-emerald-900/30 text-emerald-300'
                }`}
              >
                {message}
              </div>
            ) : null}

            {fetching ? (
              <p className="mt-6 text-slate-400">Loading machines...</p>
            ) : machines.length === 0 ? (
              <p className="mt-6 text-slate-400">No machines found.</p>
            ) : (
              <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {machines.map((machine) => {
                  const reportUrl = `${origin}/report/${machine.qr_slug}`

                  return (
                    <div
                      key={machine.id}
                      className="rounded-2xl border border-slate-800 bg-slate-950 p-5"
                    >
                      <div className="flex justify-center">
                        <div className="rounded-xl bg-white p-3">
                          <QRCodeCanvas value={reportUrl} size={180} />
                        </div>
                      </div>

                      <div className="mt-4 text-center">
                        <p className="font-semibold text-white">{machine.name}</p>
                        <p className="mt-1 text-sm text-slate-400">{machine.machine_type}</p>
                        <p className="mt-3 break-all text-xs text-slate-500">{reportUrl}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  )
}