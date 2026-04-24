'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

const links = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/setup/machines', label: 'Machines' },
  { href: '/setup/alerts', label: 'Alerts' },
  { href: '/setup/qr-codes', label: 'QR Codes' },
  { href: '/dashboard/reports', label: 'Reports' },
  { href: '/admin/print-labels', label: 'Print Labels' },
]

export default function AppNav() {
  const pathname = usePathname()
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    const id = localStorage.getItem('businessId')
    setIsLoggedIn(!!id)
  }, [])

  function handleSignOut() {
    localStorage.removeItem('businessId')
    window.location.href = '/'
  }

  return (
    <div className="mb-8 rounded-2xl border border-white/10 bg-white/5 backdrop-blur">
      <div className="flex flex-col gap-4 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
        
        {/* Left side */}
        <div>
          <Link href="/" className="text-xl font-semibold tracking-tight text-white">
            Downtimely
          </Link>
          <p className="mt-1 text-sm text-slate-400">
            Machine fault reporting and management
          </p>
        </div>

        {/* Right side nav */}
        <div className="flex flex-wrap gap-2">
          {links.map((link) => {
            const active =
              pathname === link.href ||
              (link.href !== '/dashboard' && pathname.startsWith(link.href))

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
                  active
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/30'
                    : 'border border-white/10 bg-white/5 text-slate-200 hover:bg-white/10'
                }`}
              >
                {link.label}
              </Link>
            )
          })}

          {/* Sign out (only when logged in) */}
          {isLoggedIn && (
            <button
              onClick={handleSignOut}
              className="rounded-xl border border-red-500/30 px-4 py-2 text-sm text-red-300 hover:bg-red-500/10"
            >
              Sign out
            </button>
          )}
        </div>
      </div>
    </div>
  )
}