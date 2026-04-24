'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { getBusinessId } from '@/lib/getBusinessId'
import AppNav from '@/app/components/AppNav'

type AlertRecipient = {
  id: string
  email: string
  active: boolean
}

export default function AlertSetupPage() {
  const [businessId, setBusinessId] = useState('')
  const [email, setEmail] = useState('')
  const [recipients, setRecipients] = useState<AlertRecipient[]>([])
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [message, setMessage] = useState('')
  const [isError, setIsError] = useState(false)

  useEffect(() => {
    const id = getBusinessId()
    setBusinessId(id)
  }, [])

  useEffect(() => {
    if (!businessId) return

    async function loadRecipients() {
      setFetching(true)
      setMessage('')
      setIsError(false)

      try {
        const res = await fetch(
          `/api/alert-recipients?businessId=${encodeURIComponent(businessId)}`
        )

        const text = await res.text()
        let data: { error?: string; recipients?: AlertRecipient[] } = {}

        try {
          data = JSON.parse(text)
        } catch {
          throw new Error('Server returned non-JSON response.')
        }

        if (!res.ok) {
          throw new Error(data.error || 'Failed to load recipients.')
        }

        setRecipients(data.recipients || [])
      } catch (error) {
        setIsError(true)
        setMessage(error instanceof Error ? error.message : 'Failed to load recipients.')
      } finally {
        setFetching(false)
      }
    }

    loadRecipients()
  }, [businessId])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!businessId) {
      setIsError(true)
      setMessage('No business linked. Please create an account first.')
      return
    }

    setLoading(true)
    setMessage('')
    setIsError(false)

    try {
      const res = await fetch('/api/alert-recipients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessId, email }),
      })

      const text = await res.text()
      let data: { error?: string; recipient?: AlertRecipient } = {}

      try {
        data = JSON.parse(text)
      } catch {
        throw new Error('Server returned non-JSON response.')
      }

      if (!res.ok) {
        throw new Error(data.error || 'Failed to add recipient.')
      }

      setRecipients((prev) => (data.recipient ? [data.recipient, ...prev] : prev))
      setEmail('')
      setMessage('Recipient added successfully.')
    } catch (error) {
      setIsError(true)
      setMessage(error instanceof Error ? error.message : 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id: string) {
    setDeletingId(id)
    setMessage('')
    setIsError(false)

    try {
      const res = await fetch('/api/alert-recipients', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })

      const text = await res.text()
      let data: { error?: string } = {}

      try {
        data = JSON.parse(text)
      } catch {
        throw new Error('Server returned non-JSON response.')
      }

      if (!res.ok) {
        throw new Error(data.error || 'Failed to delete recipient.')
      }

      setRecipients((prev) => prev.filter((recipient) => recipient.id !== id))
      setMessage('Recipient removed successfully.')
    } catch (error) {
      setIsError(true)
      setMessage(error instanceof Error ? error.message : 'Failed to remove recipient.')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#1e3a8a_0%,_#020617_35%,_#020617_100%)] px-4 py-10 text-white">
      <div className="mx-auto max-w-5xl">
        <AppNav />

        <div className="mb-8 flex items-center justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-blue-300">Downtimely</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">Set up alert emails</h1>
            <p className="mt-2 text-sm text-slate-300">
              Add the email addresses that should receive machine fault alerts.
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
          <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
              <h2 className="text-lg font-semibold">Add recipient</h2>

              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <div>
                  <label className="text-sm text-slate-300">Alert email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 p-3 text-white outline-none focus:border-blue-400"
                    placeholder="alerts@business.com"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-blue-600 p-3 font-medium text-white hover:bg-blue-700 disabled:opacity-60"
                >
                  {loading ? 'Adding...' : 'Add recipient'}
                </button>
              </form>

              {message && (
                <div
                  className={`mt-4 rounded-xl p-3 ${
                    isError ? 'bg-red-900/30 text-red-300' : 'bg-emerald-900/30 text-emerald-300'
                  }`}
                >
                  {message}
                </div>
              )}
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Current recipients</h2>
                {fetching ? <span className="text-sm text-slate-400">Loading...</span> : null}
              </div>

              {recipients.length === 0 ? (
                <p className="mt-4 text-slate-400">No recipients added yet.</p>
              ) : (
                <div className="mt-6 space-y-4">
                  {recipients.map((recipient) => (
                    <div
                      key={recipient.id}
                      className="flex items-center justify-between gap-4 rounded-xl border border-white/10 bg-black/20 p-4"
                    >
                      <div>
                        <p className="font-medium">{recipient.email}</p>
                        <p className="mt-1 text-sm text-slate-400">
                          {recipient.active ? 'Active' : 'Inactive'}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDelete(recipient.id)}
                        disabled={deletingId === recipient.id}
                        className="rounded-xl border border-red-500/30 px-4 py-2 text-sm text-red-300 hover:bg-red-500/10 disabled:opacity-50"
                      >
                        {deletingId === recipient.id ? 'Removing...' : 'Remove'}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  )
}