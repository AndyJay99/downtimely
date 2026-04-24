'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'

type Machine = {
  id: string
  name: string
  machine_type: string
  qr_slug: string
}

export default function ReportPage() {
  const params = useParams()
  const slug = params.slug as string

  const [machine, setMachine] = useState<Machine | null>(null)
  const [issue, setIssue] = useState('')
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [message, setMessage] = useState('')
  const [isError, setIsError] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    async function loadMachine() {
      try {
        const res = await fetch(`/api/machine-by-slug?slug=${slug}`)
        const text = await res.text()

        let data: { machine?: Machine; error?: string } = {}
        try {
          data = JSON.parse(text)
        } catch {
          throw new Error('Server returned non-JSON response.')
        }

        if (!res.ok) {
          throw new Error(data.error || 'Failed to load machine.')
        }

        setMachine(data.machine || null)
      } catch (error) {
        setIsError(true)
        setMessage(error instanceof Error ? error.message : 'Failed to load machine.')
      }
    }

    if (slug) {
      loadMachine()
    }
  }, [slug])

  async function submit() {
    if (!machine || !issue) return

    setLoading(true)
    setMessage('')
    setIsError(false)

    try {
      const res = await fetch('/api/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          machineId: machine.id,
          issue,
          customerName,
          customerPhone,
          customerEmail,
        }),
      })

      const text = await res.text()

      let data: { success?: boolean; error?: string } = {}
      try {
        data = JSON.parse(text)
      } catch {
        throw new Error('Server returned non-JSON response.')
      }

      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit report.')
      }

      setMessage('Reported. Thank you.')
      setIssue('')
      setCustomerName('')
      setCustomerPhone('')
      setCustomerEmail('')
    } catch (error) {
      setIsError(true)
      setMessage(error instanceof Error ? error.message : 'Failed to submit report.')
    } finally {
      setLoading(false)
    }
  }

  if (!machine) {
    return (
      <main className="min-h-screen bg-slate-950 px-4 py-10 text-white">
        <div className="mx-auto max-w-md rounded-3xl border border-slate-800 bg-slate-900 p-6">
          <p className="text-slate-300">Loading machine...</p>
          {message ? (
            <p className={`mt-4 ${isError ? 'text-red-300' : 'text-emerald-300'}`}>
              {message}
            </p>
          ) : null}
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-10 text-white">
      <div className="mx-auto max-w-md rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-sm">
        <p className="text-sm uppercase tracking-[0.25em] text-blue-400">Downtimely</p>

        <h1 className="mt-3 text-3xl font-semibold tracking-tight">{machine.name}</h1>

        <p className="mt-2 text-sm text-slate-300">
          Type: {machine.machine_type}
        </p>

        <div className="mt-6 space-y-3">
          <button
            type="button"
            onClick={() => setIssue('Not working')}
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-left text-white hover:bg-slate-800"
          >
            Not working
          </button>

          <button
            type="button"
            onClick={() => setIssue('Leaking')}
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-left text-white hover:bg-slate-800"
          >
            Leaking
          </button>

          <button
            type="button"
            onClick={() => setIssue('Out of order')}
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-left text-white hover:bg-slate-800"
          >
            Out of order
          </button>
        </div>

        <div className="mt-4">
          <label className="mb-2 block text-sm font-medium text-slate-200">
            More details
          </label>
          <textarea
            value={issue}
            onChange={(e) => setIssue(e.target.value)}
            className="min-h-[140px] w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            placeholder="Describe the issue..."
          />
        </div>

        <div className="mt-6 space-y-3">
          <p className="text-sm text-slate-300">
            Optional: leave your details if you'd like a follow-up or refund.
          </p>

          <input
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            placeholder="Your name"
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />

          <input
            value={customerPhone}
            onChange={(e) => setCustomerPhone(e.target.value)}
            placeholder="Phone number"
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />

          <input
            value={customerEmail}
            onChange={(e) => setCustomerEmail(e.target.value)}
            placeholder="Email address"
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <button
          onClick={submit}
          disabled={loading || !issue}
          className="mt-4 w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? 'Submitting...' : 'Submit report'}
        </button>

        {message ? (
          <div
            className={`mt-4 rounded-xl p-3 text-sm ${
              isError
                ? 'bg-red-900/30 text-red-300'
                : 'bg-emerald-900/30 text-emerald-300'
            }`}
          >
            {message}
          </div>
        ) : null}
      </div>
    </main>
  )
}