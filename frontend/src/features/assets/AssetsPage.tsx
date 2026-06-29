import { Box, Plus, Search } from 'lucide-react'
import { useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'

import { useAuth } from '../auth/AuthContext'
import { assetsApi } from './api'
import type { Asset } from './types'

type AssetForm = {
  name: string
  code: string
  category: string
  manufacturer: string
  model: string
  serialNumber: string
  plantId: string
  buildingId: string
  departmentId: string
  panelId: string
  status: 'active' | 'inactive' | 'maintenance'
}

const initialForm: AssetForm = {
  name: '',
  code: '',
  category: '',
  manufacturer: '',
  model: '',
  serialNumber: '',
  plantId: '',
  buildingId: '',
  departmentId: '',
  panelId: '',
  status: 'active' as const,
}

export const AssetsPage = () => {
  const { token, user } = useAuth()
  const [assets, setAssets] = useState<Asset[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [status, setStatus] = useState('')
  const [form, setForm] = useState<AssetForm>(initialForm)

  const canManageAssets = user?.role !== 'Operator'
  const statusClasses: Record<string, string> = {
    active: 'bg-emerald-50 text-emerald-700',
    inactive: 'bg-slate-100 text-slate-700',
    maintenance: 'bg-amber-50 text-amber-700',
  }

  const loadAssets = async () => {
    if (!token) {
      return
    }

    try {
      setLoading(true)
      setError(null)
      const response = await assetsApi.listAssets(token, { search, category, status })
      setAssets(Array.isArray(response) ? response : [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load assets')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadAssets()
  }, [token])

  useEffect(() => {
    void loadAssets()
  }, [search, category, status])

  const handleCreateAsset = async (event: FormEvent) => {
    event.preventDefault()
    if (!token) {
      return
    }

    try {
      await assetsApi.createAsset(token, form)
      setForm(initialForm)
      await loadAssets()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create asset')
    }
  }

  return (
    <section className="space-y-6">
      <div className="rounded-lg border border-slate-200 bg-white p-7 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Phase 4 assets</p>
            <h1 className="text-3xl font-bold text-slate-950">Assets and devices</h1>
          </div>
          <div className="rounded-full bg-teal-50 px-3 py-1 text-sm font-semibold text-teal-700">
            {canManageAssets ? 'Create and manage' : 'View only access'}
          </div>
        </div>
        <p className="mt-4 max-w-3xl text-slate-600">
          Track assets, assign them to hierarchy nodes, and keep device configurations linked to the same records.
        </p>
      </div>

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <Box className="h-5 w-5 text-teal-700" />
            <h2 className="text-xl font-semibold text-slate-900">Asset inventory</h2>
          </div>

          <div className="mb-4 grid gap-3 md:grid-cols-3">
            <label className="flex items-center gap-2 rounded-md border border-slate-200 px-3 py-2 text-sm">
              <Search className="h-4 w-4 text-slate-400" />
              <input
                className="w-full bg-transparent outline-none"
                placeholder="Search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </label>
            <input
              className="rounded-md border border-slate-200 px-3 py-2 text-sm"
              placeholder="Category"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
            />
            <select
              className="rounded-md border border-slate-200 px-3 py-2 text-sm"
              value={status}
              onChange={(event) => setStatus(event.target.value)}
            >
              <option value="">All statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="maintenance">Maintenance</option>
            </select>
          </div>

          {loading ? (
            <div className="rounded-md border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">Loading assets...</div>
          ) : assets.length === 0 ? (
            <div className="rounded-md border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">No assets found yet.</div>
          ) : (
            <div className="space-y-3">
              {assets.map((asset) => (
                <div key={asset.id} className="rounded-lg border border-slate-200 p-3">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-900">{asset.name}</p>
                      <p className="text-sm text-slate-500">{asset.code} • {asset.category}</p>
                    </div>
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold uppercase ${statusClasses[asset.status] ?? 'bg-slate-100 text-slate-700'}`}>
                      {asset.status}
                    </span>
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-3">
                    <p className="text-sm text-slate-600">
                      {asset.manufacturer} • {asset.model}
                    </p>
                    <Link className="text-sm font-semibold text-teal-700 hover:text-teal-800" to={`/assets/${asset.id}`}>
                      View details
                    </Link>
                  </div>
                  <p className="mt-2 text-sm text-slate-600">
                    Serial: {asset.serialNumber}
                  </p>
                  <p className="mt-2 text-sm text-slate-600">
                    Hierarchy: {asset.plantId ?? '—'} / {asset.buildingId ?? '—'} / {asset.departmentId ?? '—'} / {asset.panelId ?? '—'}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          {!canManageAssets ? (
            <div className="mb-4 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
              Operators can review assets here, but creation is disabled.
            </div>
          ) : null}

          <div className="mb-4 flex items-center gap-2">
            <Plus className="h-5 w-5 text-teal-700" />
            <h2 className="text-xl font-semibold text-slate-900">Create asset</h2>
          </div>

          <form className="grid gap-3" onSubmit={handleCreateAsset}>
            <input className="rounded-md border border-slate-300 px-3 py-2" placeholder="Asset name" value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} disabled={!canManageAssets} />
            <input className="rounded-md border border-slate-300 px-3 py-2" placeholder="Asset code" value={form.code} onChange={(event) => setForm((current) => ({ ...current, code: event.target.value }))} disabled={!canManageAssets} />
            <input className="rounded-md border border-slate-300 px-3 py-2" placeholder="Category" value={form.category} onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))} disabled={!canManageAssets} />
            <input className="rounded-md border border-slate-300 px-3 py-2" placeholder="Manufacturer" value={form.manufacturer} onChange={(event) => setForm((current) => ({ ...current, manufacturer: event.target.value }))} disabled={!canManageAssets} />
            <input className="rounded-md border border-slate-300 px-3 py-2" placeholder="Model" value={form.model} onChange={(event) => setForm((current) => ({ ...current, model: event.target.value }))} disabled={!canManageAssets} />
            <input className="rounded-md border border-slate-300 px-3 py-2" placeholder="Serial number" value={form.serialNumber} onChange={(event) => setForm((current) => ({ ...current, serialNumber: event.target.value }))} disabled={!canManageAssets} />
            <div className="grid gap-3 sm:grid-cols-2">
              <input className="rounded-md border border-slate-300 px-3 py-2" placeholder="Plant id" value={form.plantId} onChange={(event) => setForm((current) => ({ ...current, plantId: event.target.value }))} disabled={!canManageAssets} />
              <input className="rounded-md border border-slate-300 px-3 py-2" placeholder="Building id" value={form.buildingId} onChange={(event) => setForm((current) => ({ ...current, buildingId: event.target.value }))} disabled={!canManageAssets} />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <input className="rounded-md border border-slate-300 px-3 py-2" placeholder="Department id" value={form.departmentId} onChange={(event) => setForm((current) => ({ ...current, departmentId: event.target.value }))} disabled={!canManageAssets} />
              <input className="rounded-md border border-slate-300 px-3 py-2" placeholder="Panel id" value={form.panelId} onChange={(event) => setForm((current) => ({ ...current, panelId: event.target.value }))} disabled={!canManageAssets} />
            </div>
            <select className="rounded-md border border-slate-300 px-3 py-2" value={form.status} onChange={(event) => setForm((current) => ({ ...current, status: event.target.value as AssetForm['status'] }))} disabled={!canManageAssets}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="maintenance">Maintenance</option>
            </select>
            <button className="min-h-11 rounded-md bg-teal-700 px-4 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60" type="submit" disabled={!canManageAssets}>
              Save asset
            </button>
          </form>
        </div>
      </div>
    </section>
  )
}
