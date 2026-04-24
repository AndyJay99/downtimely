'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function SignInPage() {
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [isError, setIsError] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    setIsError(false)

    try {
      const res = await fetch('/api/find-user-by-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const text = await res.text()
      let data: { error?: string; businessId?: string } = {}

      try {
        data = JSON.parse(text)
      } catch {
        throw new Error('Server returned non-JSON response.')
      }

      if (!res.ok) {
        throw new Error(data.error || 'Sign in failed.')
      }

      if (!data.businessId) {
        throw new Error('No business found for this email.')
      }

      localStorage.setItem('businessId', data.businessId)
      router.push('/dashboard')
    } catch (error) {
      setIsError(true)
      setMessage(error instanceof Error ? error.message : 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 text-white">
      <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900 p-8 shadow-sm">
        <div className="mb-6">
          <Link href="/" className="text-sm text-slate-400 hover:text-white">
            ← Back to home
          </Link>
        </div>

        <h1 className="text-2xl font-semibold tracking-tight text-white">Sign in</h1>
        <p className="mt-2 text-sm text-slate-300">
          Enter your email to load your business workspace.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-200">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              placeholder="you@business.com"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        {message && (
          <div
            className={`mt-4 rounded-2xl border px-4 py-3 text-sm ${
              isError
                ? 'border-red-500 bg-red-900/30 text-red-300'
                : 'border-emerald-500 bg-emerald-900/30 text-emerald-300'
            }`}
          >
            {message}
          </div>
        )}

        <p className="mt-6 text-sm text-slate-400">
          Need an account?{' '}
          <Link href="/signup" className="text-blue-400 hover:text-blue-300">
            Create one
          </Link>
        </p>
      </div>
    </main>
  )
}