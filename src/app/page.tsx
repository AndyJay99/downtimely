import Link from 'next/link'
import AppNav from './components/AppNav'

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#1e3a8a_0%,_#020617_35%,_#020617_100%)] px-4 py-10 text-white">
      <div className="mx-auto max-w-6xl">
        <AppNav />

        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl shadow-black/20 backdrop-blur">
            <p className="text-sm font-medium uppercase tracking-[0.25em] text-blue-300">
              Fault reporting for unattended machines
            </p>

            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              Capture machine issues fast and manage downtime in one place.
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300">
              Downtimely helps laundromats, dog washes, car washes and other unattended machine
              businesses collect fault reports, alert staff instantly, and resolve issues faster.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/signup"
                className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-blue-700"
              >
                Create account
              </Link>

              <Link
                href="/dashboard"
                className="rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-medium text-slate-100 transition hover:bg-white/10"
              >
                Open dashboard
              </Link>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
              <h2 className="text-lg font-semibold">How it works</h2>
              <ol className="mt-4 space-y-3 text-sm text-slate-300">
                <li>1. Add your machines</li>
                <li>2. Add alert recipients</li>
                <li>3. Generate QR codes</li>
                <li>4. Customer scans and reports issue</li>
                <li>5. You get alerted and resolve it</li>
              </ol>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
              <h2 className="text-lg font-semibold">Live now</h2>
              <ul className="mt-4 space-y-2 text-sm text-slate-300">
                <li>• Machine setup</li>
                <li>• Email alerts</li>
                <li>• QR code reporting</li>
                <li>• Reports dashboard</li>
                <li>• Resolve workflow</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}