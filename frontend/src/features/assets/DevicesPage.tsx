import { Cpu, Plus, RefreshCcw, Search } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'

import { useAuth } from '../auth/AuthContext'
import { assetsApi } from './api'
import type { Device } from './device-types'
import type { Asset } from './types'

type DeviceForm = {
  assetId: string
  name: string
  ipAddress: string
  protocol: 'ModbusTCP' | 'ModbusRTU' | 'EthernetIP' | 'OPC-UA'
  port: number
  modbusAddress: number
  communicationType: string
  pollingInterval: number
  status: 'online' | 'offline' | 'maintenance' | 'disabled'
}

const initialDeviceForm: DeviceForm = {
  assetId: '',
  name: '',
  ipAddress: '',
  protocol: 'ModbusTCP',
  port: 502,
  modbusAddress: 1,
  communicationType: 'Ethernet',
  pollingInterval: 30,
  status: 'online',
}

export const DevicesPage = () => {
  const { token, user } = useAuth()
  const [assets, setAssets] = useState<Asset[]>([])
  const [devices, setDevices] = useState<Device[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [protocol, setProtocol] = useState('')
  const [selectedAssetId, setSelectedAssetId] = useState('')
  const [form, setForm] = useState<DeviceForm>(initialDeviceForm)

  const canManageDevices = user?.role !== 'Operator'
  const statusClasses: Record<string, string> = {
    online: 'bg-emerald-50 text-emerald-700',
    offline: 'bg-red-50 text-red-700',
    maintenance: 'bg-amber-50 text-amber-700',
    disabled: 'bg-slate-100 text-slate-700',
  }
  const assetsById = useMemo(
    () => new Map(assets.map((asset) => [asset.id, asset])),
    [assets],
  )

  const loadDevices = useCallback(async () => {
    if (!token) {
      return
    }

    try {
      setLoading(true)
      setError(null)
      const response = await assetsApi.listDevices(token, {
        assetId: selectedAssetId,
        search,
        status,
        protocol,
      })
      setDevices(Array.isArray(response) ? response : [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load devices')
    } finally {
      setLoading(false)
    }
  }, [protocol, search, selectedAssetId, status, token])

  const loadAssets = useCallback(async () => {
    if (!token) {
      return
    }

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

  useEffect(() => {
    void loadAssets()
  }, [loadAssets])

  useEffect(() => {
    void loadDevices()
  }, [loadDevices])

  const handleCreateDevice = async (event: FormEvent) => {
    event.preventDefault()
    if (!token) {
      return
    }

    try {
      await assetsApi.createDevice(token, form)
      setForm((current) => ({
        ...initialDeviceForm,
        assetId: current.assetId,
      }))
      await loadDevices()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create device')
    }
  }

  const handleSimulateStatus = async (deviceId: string) => {
    if (!token) {
      return
    }

    try {
      await assetsApi.simulateDeviceStatus(token, deviceId)
      await loadDevices()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update device status')
    }
  }

  return (
    <section className="space-y-6">
      <div className="rounded-lg border border-slate-200 bg-white p-7 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Phase 4 devices</p>
            <h1 className="text-3xl font-bold text-slate-950">Device configurations</h1>
          </div>
          <div className="rounded-full bg-teal-50 px-3 py-1 text-sm font-semibold text-teal-700">
            {canManageDevices ? 'Create and manage' : 'View only access'}
          </div>
        </div>
        <p className="mt-4 max-w-3xl text-slate-600">
          Configure communication settings for existing assets and monitor simulated device status changes.
        </p>
      </div>

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <Cpu className="h-5 w-5 text-teal-700" />
            <h2 className="text-xl font-semibold text-slate-900">Device list</h2>
          </div>

          <div className="mb-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <label className="flex items-center gap-2 rounded-md border border-slate-200 px-3 py-2 text-sm">
              <Search className="h-4 w-4 text-slate-400" />
              <input
                className="w-full bg-transparent outline-none"
                placeholder="Search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </label>
            <select
              className="rounded-md border border-slate-200 px-3 py-2 text-sm"
              value={selectedAssetId}
              onChange={(event) => setSelectedAssetId(event.target.value)}
            >
              <option value="">All assets</option>
              {assets.map((asset) => (
                <option key={asset.id} value={asset.id}>{asset.name} ({asset.code})</option>
              ))}
            </select>
            <select
              className="rounded-md border border-slate-200 px-3 py-2 text-sm"
              value={protocol}
              onChange={(event) => setProtocol(event.target.value)}
            >
              <option value="">All protocols</option>
              <option value="ModbusTCP">ModbusTCP</option>
              <option value="ModbusRTU">ModbusRTU</option>
              <option value="EthernetIP">EthernetIP</option>
              <option value="OPC-UA">OPC-UA</option>
            </select>
            <select
              className="rounded-md border border-slate-200 px-3 py-2 text-sm"
              value={status}
              onChange={(event) => setStatus(event.target.value)}
            >
              <option value="">All statuses</option>
              <option value="online">Online</option>
              <option value="offline">Offline</option>
              <option value="maintenance">Maintenance</option>
              <option value="disabled">Disabled</option>
            </select>
          </div>

          {loading ? (
            <div className="rounded-md border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">Loading devices...</div>
          ) : devices.length === 0 ? (
            <div className="rounded-md border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">No devices found yet.</div>
          ) : (
            <div className="space-y-3">
              {devices.map((device) => {
                const asset = assetsById.get(device.assetId)

                return (
                  <div key={device.id} className="rounded-lg border border-slate-200 p-3">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-slate-900">{device.name}</p>
                        <p className="text-sm text-slate-500">{device.protocol} • Port {device.port}</p>
                      </div>
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold uppercase ${statusClasses[device.status] ?? 'bg-slate-100 text-slate-700'}`}>
                        {device.status}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-slate-600">IP: {device.ipAddress ?? '-'} • Polling: {device.pollingInterval}s</p>
                    <p className="mt-2 text-sm text-slate-600">
                      Asset:{' '}
                      {asset ? (
                        <Link className="font-semibold text-teal-700 hover:text-teal-800" to={`/assets/${asset.id}`}>{asset.name}</Link>
                      ) : (
                        device.assetId
                      )}
                    </p>
                    {canManageDevices ? (
                      <button className="mt-3 inline-flex min-h-10 items-center gap-2 rounded-md border border-slate-200 px-3 text-sm font-semibold text-slate-700 hover:bg-slate-50" type="button" onClick={() => void handleSimulateStatus(device.id)}>
                        <RefreshCcw className="h-4 w-4" />
                        Simulate status change
                      </button>
                    ) : null}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          {!canManageDevices ? (
            <div className="mb-4 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
              Operators can review device configurations here, but creation is disabled.
            </div>
          ) : null}

          <div className="mb-4 flex items-center gap-2">
            <Plus className="h-5 w-5 text-teal-700" />
            <h2 className="text-xl font-semibold text-slate-900">Add device</h2>
          </div>

          <form className="grid gap-3" onSubmit={handleCreateDevice}>
            <select className="rounded-md border border-slate-300 px-3 py-2" value={form.assetId} onChange={(event) => setForm((current) => ({ ...current, assetId: event.target.value }))} disabled={!canManageDevices}>
              <option value="">Select asset</option>
              {assets.map((asset) => (
                <option key={asset.id} value={asset.id}>{asset.name} ({asset.code})</option>
              ))}
            </select>
            <input className="rounded-md border border-slate-300 px-3 py-2" placeholder="Device name" value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} disabled={!canManageDevices} />
            <input className="rounded-md border border-slate-300 px-3 py-2" placeholder="IP address" value={form.ipAddress} onChange={(event) => setForm((current) => ({ ...current, ipAddress: event.target.value }))} disabled={!canManageDevices} />
            <select className="rounded-md border border-slate-300 px-3 py-2" value={form.protocol} onChange={(event) => setForm((current) => ({ ...current, protocol: event.target.value as DeviceForm['protocol'] }))} disabled={!canManageDevices}>
              <option value="ModbusTCP">ModbusTCP</option>
              <option value="ModbusRTU">ModbusRTU</option>
              <option value="EthernetIP">EthernetIP</option>
              <option value="OPC-UA">OPC-UA</option>
            </select>
            <div className="grid gap-3 sm:grid-cols-2">
              <input className="rounded-md border border-slate-300 px-3 py-2" placeholder="Port" type="number" value={form.port} onChange={(event) => setForm((current) => ({ ...current, port: Number(event.target.value) }))} disabled={!canManageDevices} />
              <input className="rounded-md border border-slate-300 px-3 py-2" placeholder="Modbus address" type="number" value={form.modbusAddress} onChange={(event) => setForm((current) => ({ ...current, modbusAddress: Number(event.target.value) }))} disabled={!canManageDevices} />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <input className="rounded-md border border-slate-300 px-3 py-2" placeholder="Communication type" value={form.communicationType} onChange={(event) => setForm((current) => ({ ...current, communicationType: event.target.value }))} disabled={!canManageDevices} />
              <input className="rounded-md border border-slate-300 px-3 py-2" placeholder="Polling interval" type="number" value={form.pollingInterval} onChange={(event) => setForm((current) => ({ ...current, pollingInterval: Number(event.target.value) }))} disabled={!canManageDevices} />
            </div>
            <select className="rounded-md border border-slate-300 px-3 py-2" value={form.status} onChange={(event) => setForm((current) => ({ ...current, status: event.target.value as DeviceForm['status'] }))} disabled={!canManageDevices}>
              <option value="online">Online</option>
              <option value="offline">Offline</option>
              <option value="maintenance">Maintenance</option>
              <option value="disabled">Disabled</option>
            </select>
            <button className="min-h-11 rounded-md bg-teal-700 px-4 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60" type="submit" disabled={!canManageDevices || !form.assetId}>Save device</button>
          </form>
        </div>
      </div>
    </section>
  )
}
