'use client'

import { useEffect, useState } from 'react'
import { getBusinessId } from '@/lib/getBusinessId'
import AppNav from '@/app/components/AppNav'

type Machine = {
  id: string
  name: string
  machine_type: string
  qr_slug: string
  active?: boolean
}

const machineTypes = [
  { value: 'washer', label: 'Washer' },
  { value: 'dryer', label: 'Dryer' },
  { value: 'dog-wash', label: 'Dog Wash' },
  { value: 'coin-machine', label: 'Coin Machine' },
  { value: 'other', label: 'Other' },
]

export default function MachinesPage() {
  const [businessId, setBusinessId] = useState('')
  const [machines, setMachines] = useState<Machine[]>([])
  const [name, setName] = useState('')
  const [machineType, setMachineType] = useState('washer')
  const [loading, setLoading] = useState(false)

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')
  const [editingType, setEditingType] = useState('washer')
  const [savingId, setSavingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const [message, setMessage] = useState('')
  const [isError, setIsError] = useState(false)

  useEffect(() => {
    const id = getBusinessId()
    setBusinessId(id)
  }, [])

  useEffect(() => {
    if (!businessId) return

    async function loadMachines() {
      try {
        const res = await fetch(`/api/machines?businessId=${encodeURIComponent(businessId)}`)
        const text = await res.text()

        let data: { machines?: Machine[]; error?: string } = {}
        try {
          data = JSON.parse(text)
        } catch {
          throw new Error('Server returned non-JSON response.')
        }

        if (!res.ok) {
          throw new Error(data.error || 'Failed to load machines')
        }

        setMachines(data.machines || [])
      } catch (error) {
        setIsError(true)
        setMessage(error instanceof Error ? error.message : 'Failed to load machines.')
      }
    }

    loadMachines()
  }, [businessId])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!businessId) {
      setIsError(true)
      setMessage('No business linked. Please sign up again.')
      return
    }

    setLoading(true)
    setMessage('')
    setIsError(false)

    try {
      const res = await fetch('/api/machines', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessId, name, machineType }),
      })

      const text = await res.text()
      let data: { machine?: Machine; error?: string } = {}

      try {
        data = JSON.parse(text)
      } catch {
        throw new Error('Server returned non-JSON response.')
      }

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create machine')
      }

      setMachines((prev) => (data.machine ? [data.machine, ...prev] : prev))
      setName('')
      setMachineType('washer')
      setMessage('Machine added successfully.')
    } catch (error) {
      setIsError(true)
      setMessage(error instanceof Error ? error.message : 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  function startEditing(machine: Machine) {
    setEditingId(machine.id)
    setEditingName(machine.name)
    setEditingType(machine.machine_type)
    setMessage('')
    setIsError(false)
  }

  function cancelEditing() {
    setEditingId(null)
    setEditingName('')
    setEditingType('washer')
  }

  async function saveEdit(id: string) {
    if (!editingName.trim()) {
      setIsError(true)
      setMessage('Machine name cannot be empty.')
      return
    }

    setSavingId(id)
    setMessage('')
    setIsError(false)

    try {
      const res = await fetch('/api/machines', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          name: editingName.trim(),
          machineType: editingType,
        }),
      })

      const text = await res.text()
      let data: { machine?: Machine; error?: string } = {}

      try {
        data = JSON.parse(text)
      } catch {
        throw new Error('Server returned non-JSON response.')
      }

      if (!res.ok) {
        throw new Error(data.error || 'Failed to update machine.')
      }

      setMachines((prev) =>
        prev.map((machine) => (machine.id === id && data.machine ? data.machine : machine))
      )

      setEditingId(null)
      setEditingName('')
      setEditingType('washer')
      setMessage('Machine updated successfully.')
    } catch (error) {
      setIsError(true)
      setMessage(error instanceof Error ? error.message : 'Failed to update machine.')
    } finally {
      setSavingId(null)
    }
  }

  async function deleteMachine(id: string) {
    const confirmed = window.confirm('Are you sure you want to delete this machine?')
    if (!confirmed) return

    setDeletingId(id)
    setMessage('')
    setIsError(false)

    try {
      const res = await fetch('/api/machines', {
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
        throw new Error(data.error || 'Failed to delete machine.')
      }

      setMachines((prev) => prev.filter((machine) => machine.id !== id))

      if (editingId === id) {
        setEditingId(null)
        setEditingName('')
        setEditingType('washer')
      }

      setMessage('Machine removed successfully.')
    } catch (error) {
      setIsError(true)
      setMessage(error instanceof Error ? error.message : 'Failed to delete machine.')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#1e3a8a_0%,_#020617_35%,_#020617_100%)] px-4 py-10 text-white">
      <div className="mx-auto max-w-5xl">
        <AppNav />

        <h1 className="text-2xl font-semibold">Machines</h1>
        <p className="mt-2 text-sm text-slate-400">
          Add and manage your machines. QR codes will be generated automatically.
        </p>

        {!businessId ? (
          <p className="mt-6 text-slate-400">
            No business linked yet. Please create an account first.
          </p>
        ) : (
          <>
            <form
              onSubmit={handleSubmit}
              className="mt-6 space-y-4 rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur"
            >
              <div>
                <label className="block text-sm text-slate-300">Machine name</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="mt-1 w-full rounded-xl border border-white/10 bg-black/20 px-3 py-3 text-sm text-white outline-none focus:border-blue-400"
                  placeholder="Washer 1"
                />
              </div>

              <div>
                <label className="block text-sm text-slate-300">Machine type</label>
                <select
                  value={machineType}
                  onChange={(e) => setMachineType(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-white/10 bg-black/20 px-3 py-3 text-sm text-white outline-none focus:border-blue-400"
                >
                  {machineTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Adding...' : 'Add machine'}
              </button>

              {message && (
                <p className={`text-sm ${isError ? 'text-red-400' : 'text-green-400'}`}>
                  {message}
                </p>
              )}
            </form>

            <div className="mt-8 space-y-4">
              {machines.length === 0 ? (
                <p className="text-sm text-slate-400">No machines yet.</p>
              ) : (
                machines.map((machine) => (
                  <div
                    key={machine.id}
                    className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur"
                  >
                    {editingId === machine.id ? (
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm text-slate-300">Machine name</label>
                          <input
                            value={editingName}
                            onChange={(e) => setEditingName(e.target.value)}
                            className="mt-1 w-full rounded-xl border border-white/10 bg-black/20 px-3 py-3 text-sm text-white outline-none focus:border-blue-400"
                          />
                        </div>

                        <div>
                          <label className="block text-sm text-slate-300">Machine type</label>
                          <select
                            value={editingType}
                            onChange={(e) => setEditingType(e.target.value)}
                            className="mt-1 w-full rounded-xl border border-white/10 bg-black/20 px-3 py-3 text-sm text-white outline-none focus:border-blue-400"
                          >
                            {machineTypes.map((type) => (
                              <option key={type.value} value={type.value}>
                                {type.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => saveEdit(machine.id)}
                            disabled={savingId === machine.id}
                            className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                          >
                            {savingId === machine.id ? 'Saving...' : 'Save'}
                          </button>

                          <button
                            type="button"
                            onClick={cancelEditing}
                            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 hover:bg-white/10"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                        <div>
                          <p className="font-medium">{machine.name}</p>
                          <p className="text-sm text-slate-400">Type: {machine.machine_type}</p>
                          <p className="text-xs text-slate-500">QR: /report/{machine.qr_slug}</p>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => startEditing(machine)}
                            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 hover:bg-white/10"
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() => deleteMachine(machine.id)}
                            disabled={deletingId === machine.id}
                            className="rounded-xl border border-red-500/30 px-4 py-2 text-sm text-red-300 hover:bg-red-500/10 disabled:opacity-50"
                          >
                            {deletingId === machine.id ? 'Removing...' : 'Delete'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>
    </main>
  )
}