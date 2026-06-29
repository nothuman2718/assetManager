import { CalendarClock, Download, Plus, Save, Search } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'

import { assetsApi } from '../assets/api'
import type { Asset } from '../assets/types'
import { useAuth } from '../auth/AuthContext'
import { maintenanceApi } from './api'
import type { MaintenanceFormPayload, MaintenanceRecord, MaintenanceStatus } from './types'

type MaintenanceForm = MaintenanceFormPayload & {
  status: MaintenanceStatus
}

const initialForm: MaintenanceForm = {
  assetId: '',
  lastInspectionDate: '',
  lastServiceDate: '',
  warrantyUntil: '',
  technician: '',
  nextMaintenanceDate: '',
  status: 'scheduled',
  notes: '',
}

const formatDate = (date?: string | null) => (date ? new Date(date).toLocaleDateString() : '-')
const toInputDate = (date?: string | null) => (date ? date.slice(0, 10) : '')

export const MaintenancePage = () => {
  const { token, user } = useAuth()
  const [assets, setAssets] = useState<Asset[]>([])
  const [records, setRecords] = useState<MaintenanceRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState('')
  const [assetId, setAssetId] = useState('')
  const [form, setForm] = useState<MaintenanceForm>(initialForm)
  const [editingId, setEditingId] = useState<string | null>(null)

  const canManageMaintenance = user?.role !== 'Operator'
  const assetsById = useMemo(
    () => new Map(assets.map((asset) => [asset.id, asset])),
    [assets],
  )
  const statusClasses: Record<string, string> = {
    scheduled: 'bg-teal-50 text-teal-700',
    completed: 'bg-emerald-50 text-emerald-700',
    overdue: 'bg-red-50 text-red-700',
    cancelled: 'bg-slate-100 text-slate-700',
  }

  const loadAssets = useCallback(async () => {
    if (!token) return

    try {
      const response = await assetsApi.listAssets(token)
      const nextAssets = Array.isArray(response) ? response : []
      setAssets(nextAssets)
      setForm((current) => ({
        ...current,
        assetId: current.assetId || nextAssets[0]?.id || '',
      }))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load asset options')
    }
  }, [token])

  const loadRecords = useCallback(async () => {
    if (!token) return

    try {
      setLoading(true)
      setError(null)
      const response = await maintenanceApi.list(token, { assetId, status })
      setRecords(Array.isArray(response) ? response : [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load maintenance')
    } finally {
      setLoading(false)
    }
  }, [assetId, status, token])

  useEffect(() => {
    void loadAssets()
  }, [loadAssets])

  useEffect(() => {
    void loadRecords()
  }, [loadRecords])

  const resetForm = () => {
    setEditingId(null)
    setForm({
      ...initialForm,
      assetId: assets[0]?.id ?? '',
    })
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (!token) return

    try {
      if (editingId) {
        await maintenanceApi.update(token, editingId, form)
      } else {
        await maintenanceApi.create(token, form)
      }
      resetForm()
      await loadRecords()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save maintenance')
    }
  }

  const startEdit = (record: MaintenanceRecord) => {
    setEditingId(record.id)
    setForm({
      assetId: record.assetId,
      lastInspectionDate: toInputDate(record.lastInspectionDate),
      lastServiceDate: toInputDate(record.lastServiceDate),
      warrantyUntil: toInputDate(record.warrantyUntil),
      technician: record.technician,
      nextMaintenanceDate: toInputDate(record.nextMaintenanceDate),
      status: record.status,
      notes: record.notes ?? '',
    })
  }

  const handleExport = async () => {
    if (!token) return

    try {
      await maintenanceApi.exportCsv(token, { assetId, status })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to export maintenance')
    }
  }

  return (
    <section className="space-y-6">
      <div className="rounded-lg border border-slate-200 bg-white p-7 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Phase 5 maintenance</p>
            <h1 className="text-3xl font-bold text-slate-950">Maintenance records</h1>
          </div>
          <div className="rounded-full bg-teal-50 px-3 py-1 text-sm font-semibold text-teal-700">
            {canManageMaintenance ? 'Create and manage' : 'View only access'}
          </div>
        </div>
        <p className="mt-4 max-w-3xl text-slate-600">
          Track inspection history, service dates, warranty coverage, and simple date-based upcoming or overdue maintenance.
        </p>
      </div>

      {error ? <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div> : null}

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <CalendarClock className="h-5 w-5 text-teal-700" />
              <h2 className="text-xl font-semibold text-slate-900">Maintenance list</h2>
            </div>
            <button className="inline-flex min-h-10 items-center gap-2 rounded-md border border-slate-200 px-3 text-sm font-semibold text-slate-700 hover:bg-slate-50" type="button" onClick={() => void handleExport()}>
              <Download className="h-4 w-4" />
              Export CSV
            </button>
          </div>

          <div className="mb-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            <label className="flex items-center gap-2 rounded-md border border-slate-200 px-3 py-2 text-sm">
              <Search className="h-4 w-4 text-slate-400" />
              <select className="w-full bg-transparent outline-none" value={assetId} onChange={(event) => setAssetId(event.target.value)}>
                <option value="">All assets</option>
                {assets.map((asset) => (
                  <option key={asset.id} value={asset.id}>{asset.name} ({asset.code})</option>
                ))}
              </select>
            </label>
            <select className="rounded-md border border-slate-200 px-3 py-2 text-sm" value={status} onChange={(event) => setStatus(event.target.value)}>
              <option value="">All statuses</option>
              <option value="upcoming">Upcoming</option>
              <option value="overdue">Overdue</option>
              <option value="scheduled">Scheduled</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {loading ? (
            <div className="rounded-md border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">Loading maintenance...</div>
          ) : records.length === 0 ? (
            <div className="rounded-md border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">No maintenance records found.</div>
          ) : (
            <div className="space-y-3">
              {records.map((record) => {
                const asset = assetsById.get(record.assetId)

                return (
                  <div key={record.id} className="rounded-lg border border-slate-200 p-3">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-slate-900">{asset?.name ?? record.assetId}</p>
                        <p className="text-sm text-slate-500">Technician: {record.technician}</p>
                      </div>
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold uppercase ${statusClasses[record.status] ?? 'bg-slate-100 text-slate-700'}`}>
                        {record.status}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-slate-600">Next maintenance: {formatDate(record.nextMaintenanceDate)}</p>
                    <p className="mt-1 text-sm text-slate-600">Last service: {formatDate(record.lastServiceDate)} • Warranty: {formatDate(record.warrantyUntil)}</p>
                    {record.notes ? <p className="mt-2 text-sm text-slate-600">{record.notes}</p> : null}
                    <div className="mt-3 flex flex-wrap gap-2">
                      {asset ? <Link className="text-sm font-semibold text-teal-700 hover:text-teal-800" to={`/assets/${asset.id}`}>View asset</Link> : null}
                      {canManageMaintenance ? (
                        <button className="text-sm font-semibold text-slate-700 hover:text-slate-950" type="button" onClick={() => startEdit(record)}>Edit</button>
                      ) : null}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          {!canManageMaintenance ? (
            <div className="mb-4 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
              Operators can view maintenance history here, but changes are disabled.
            </div>
          ) : null}

          <div className="mb-4 flex items-center gap-2">
            {editingId ? <Save className="h-5 w-5 text-teal-700" /> : <Plus className="h-5 w-5 text-teal-700" />}
            <h2 className="text-xl font-semibold text-slate-900">{editingId ? 'Edit maintenance' : 'Add maintenance'}</h2>
          </div>

          <form className="grid gap-3" onSubmit={handleSubmit}>
            <select className="rounded-md border border-slate-300 px-3 py-2" value={form.assetId} onChange={(event) => setForm((current) => ({ ...current, assetId: event.target.value }))} disabled={!canManageMaintenance}>
              <option value="">Select asset</option>
              {assets.map((asset) => (
                <option key={asset.id} value={asset.id}>{asset.name} ({asset.code})</option>
              ))}
            </select>
            <input className="rounded-md border border-slate-300 px-3 py-2" placeholder="Technician" value={form.technician} onChange={(event) => setForm((current) => ({ ...current, technician: event.target.value }))} disabled={!canManageMaintenance} />
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="grid gap-1 text-xs font-semibold uppercase text-slate-500">
                Next maintenance
                <input className="rounded-md border border-slate-300 px-3 py-2 text-base font-normal normal-case text-slate-950" type="date" value={form.nextMaintenanceDate} onChange={(event) => setForm((current) => ({ ...current, nextMaintenanceDate: event.target.value }))} disabled={!canManageMaintenance} />
              </label>
              <label className="grid gap-1 text-xs font-semibold uppercase text-slate-500">
                Last service
                <input className="rounded-md border border-slate-300 px-3 py-2 text-base font-normal normal-case text-slate-950" type="date" value={form.lastServiceDate} onChange={(event) => setForm((current) => ({ ...current, lastServiceDate: event.target.value }))} disabled={!canManageMaintenance} />
              </label>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="grid gap-1 text-xs font-semibold uppercase text-slate-500">
                Last inspection
                <input className="rounded-md border border-slate-300 px-3 py-2 text-base font-normal normal-case text-slate-950" type="date" value={form.lastInspectionDate} onChange={(event) => setForm((current) => ({ ...current, lastInspectionDate: event.target.value }))} disabled={!canManageMaintenance} />
              </label>
              <label className="grid gap-1 text-xs font-semibold uppercase text-slate-500">
                Warranty until
                <input className="rounded-md border border-slate-300 px-3 py-2 text-base font-normal normal-case text-slate-950" type="date" value={form.warrantyUntil} onChange={(event) => setForm((current) => ({ ...current, warrantyUntil: event.target.value }))} disabled={!canManageMaintenance} />
              </label>
            </div>
            <select className="rounded-md border border-slate-300 px-3 py-2" value={form.status} onChange={(event) => setForm((current) => ({ ...current, status: event.target.value as MaintenanceStatus }))} disabled={!canManageMaintenance}>
              <option value="scheduled">Scheduled</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <textarea className="min-h-24 rounded-md border border-slate-300 px-3 py-2" placeholder="Notes" value={form.notes} onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))} disabled={!canManageMaintenance} />
            <div className="grid gap-3 sm:grid-cols-2">
              <button className="min-h-11 rounded-md bg-teal-700 px-4 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60" type="submit" disabled={!canManageMaintenance || !form.assetId}>Save maintenance</button>
              <button className="min-h-11 rounded-md border border-slate-300 px-4 font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-60" type="button" onClick={resetForm} disabled={!canManageMaintenance}>Clear</button>
            </div>
          </form>
        </div>
      </div>
    </section>
  )
}
