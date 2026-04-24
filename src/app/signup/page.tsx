'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function SignUpPage() {
  const router = useRouter()

  const [businessName, setBusinessName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [isError, setIsError] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    setIsError(false)

    try {
      const res = await fetch('/api/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          businessName,
          email,
          password,
        }),
      })

      const text = await res.text()
      let data: { error?: string; success?: boolean; businessId?: string } = {}

      try {
        data = JSON.parse(text)
      } catch {
        throw new Error(`Server returned non-JSON response: ${text.slice(0, 120)}`)
      }

      if (!res.ok) {
        throw new Error(data.error || 'Something went wrong.')
      }

      if (data.businessId) {
        localStorage.setItem('businessId', data.businessId)
        router.push('/setup/machines')
        return
      }

      setMessage('Account created successfully.')
      setBusinessName('')
      setEmail('')
      setPassword('')
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

        <h1 className="text-2xl font-semibold tracking-tight text-white">
          Create your account
        </h1>
        <p className="mt-2 text-sm text-slate-300">
          Set up your business and start tracking machine faults.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-200">
              Business name
            </label>
            <input
              type="text"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              placeholder="Example: Southside Laundry"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-200">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              placeholder="you@business.com"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-200">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              placeholder="Create a password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Creating...' : 'Create account'}
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
          Already have an account?{' '}
          <Link href="/signin" className="text-blue-400 hover:text-blue-300">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  )
}