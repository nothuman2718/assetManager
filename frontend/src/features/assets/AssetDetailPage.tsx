import { CalendarClock, Plus, RefreshCcw, Wrench } from 'lucide-react'
import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { useParams } from 'react-router-dom'

import { useAuth } from '../auth/AuthContext'
import { maintenanceApi } from '../maintenance/api'
import type { MaintenanceRecord } from '../maintenance/types'
import { assetsApi } from './api'
import type { Asset } from './types'
import type { Device } from './device-types'

const initialDeviceForm = {
  name: '',
  ipAddress: '',
  protocol: 'ModbusTCP' as const,
  port: 502,
  modbusAddress: 1,
  communicationType: 'Ethernet',
  pollingInterval: 30,
  status: 'online' as const,
}

const initialMaintenanceForm = {
  technician: '',
  nextMaintenanceDate: '',
  lastInspectionDate: '',
  lastServiceDate: '',
  warrantyUntil: '',
  notes: '',
  status: 'scheduled' as const,
}

const formatDate = (date?: string | null) => (date ? new Date(date).toLocaleDateString() : '-')

export const AssetDetailPage = () => {
  const { id } = useParams<{ id: string }>()
  const { token, user } = useAuth()
  const [asset, setAsset] = useState<Asset | null>(null)
  const [devices, setDevices] = useState<Device[]>([])
  const [maintenanceRecords, setMaintenanceRecords] = useState<MaintenanceRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deviceForm, setDeviceForm] = useState(initialDeviceForm)
  const [maintenanceForm, setMaintenanceForm] = useState(initialMaintenanceForm)

  const canManageAssets = user?.role !== 'Operator'
  const statusClasses: Record<string, string> = {
    active: 'bg-emerald-50 text-emerald-700',
    inactive: 'bg-slate-100 text-slate-700',
    maintenance: 'bg-amber-50 text-amber-700',
  }

  const loadAssetDetails = useCallback(async () => {
    if (!token || !id) {
      return
    }

    try {
      setLoading(true)
      setError(null)
      const [assetData, deviceData] = await Promise.all([
        assetsApi.getAsset(token, id),
        assetsApi.listDevices(token, { assetId: id }),
      ])
      const maintenanceData = await maintenanceApi.list(token, { assetId: id })
      setAsset(assetData)
      setDevices(Array.isArray(deviceData) ? deviceData : [])
      setMaintenanceRecords(Array.isArray(maintenanceData) ? maintenanceData : [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load asset details')
    } finally {
      setLoading(false)
    }
  }, [id, token])

  useEffect(() => {
    void loadAssetDetails()
  }, [loadAssetDetails])

  const handleCreateDevice = async (event: FormEvent) => {
    event.preventDefault()
    if (!token || !id) {
      return
    }

    try {
      await assetsApi.createDevice(token, {
        ...deviceForm,
        assetId: id,
      })
      setDeviceForm(initialDeviceForm)
      await loadAssetDetails()
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
      await loadAssetDetails()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update device status')
    }
  }

  const handleCreateMaintenance = async (event: FormEvent) => {
    event.preventDefault()
    if (!token || !id) {
      return
    }

    try {
      await maintenanceApi.create(token, {
        ...maintenanceForm,
        assetId: id,
      })
      setMaintenanceForm(initialMaintenanceForm)
      await loadAssetDetails()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create maintenance')
    }
  }

  if (loading) {
    return <div className="rounded-lg border border-slate-200 bg-white p-6 text-sm text-slate-600">Loading asset details...</div>
  }

  if (!asset) {
    return <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-sm text-red-700">Asset not found.</div>
  }

  return (
    <section className="space-y-6">
      <div className="rounded-lg border border-slate-200 bg-white p-7 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Asset detail</p>
            <h1 className="text-3xl font-bold text-slate-950">{asset.name}</h1>
            <p className="mt-2 text-slate-600">{asset.code} • {asset.category}</p>
          </div>
          <span className={`rounded-full px-3 py-1 text-sm font-semibold uppercase ${statusClasses[asset.status] ?? 'bg-slate-100 text-slate-700'}`}>{asset.status}</span>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
            <p className="font-semibold text-slate-900">Manufacturer</p>
            <p>{asset.manufacturer}</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
            <p className="font-semibold text-slate-900">Model</p>
            <p>{asset.model}</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
            <p className="font-semibold text-slate-900">Serial number</p>
            <p>{asset.serialNumber}</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
            <p className="font-semibold text-slate-900">Hierarchy</p>
            <p>{asset.plantId ?? '—'} / {asset.buildingId ?? '—'} / {asset.departmentId ?? '—'} / {asset.panelId ?? '—'}</p>
          </div>
        </div>
      </div>

      {error ? <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div> : null}

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <Wrench className="h-5 w-5 text-teal-700" />
            <h2 className="text-xl font-semibold text-slate-900">Device section</h2>
          </div>
          <div className="space-y-3">
            {devices.length === 0 ? (
              <div className="rounded-md border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">No devices linked to this asset yet.</div>
            ) : devices.map((device) => (
              <div key={device.id} className="rounded-lg border border-slate-200 p-3">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-900">{device.name}</p>
                    <p className="text-sm text-slate-500">{device.protocol} • Port {device.port}</p>
                  </div>
                  <span className="rounded-full bg-teal-50 px-2.5 py-1 text-xs font-semibold uppercase text-teal-700">{device.status}</span>
                </div>
                <p className="mt-2 text-sm text-slate-600">IP: {device.ipAddress ?? '—'} • Polling: {device.pollingInterval}s</p>
                {canManageAssets ? (
                  <button className="mt-3 inline-flex items-center gap-2 rounded-md border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50" type="button" onClick={() => void handleSimulateStatus(device.id)}>
                    <RefreshCcw className="h-4 w-4" />
                    Simulate status change
                  </button>
                ) : null}
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          {!canManageAssets ? (
            <div className="mb-4 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">Operators can review device details here, but configuration is disabled.</div>
          ) : null}

          <div className="mb-4 flex items-center gap-2">
            <Plus className="h-5 w-5 text-teal-700" />
            <h2 className="text-xl font-semibold text-slate-900">Add device</h2>
          </div>

          <form className="grid gap-3" onSubmit={handleCreateDevice}>
            <input className="rounded-md border border-slate-300 px-3 py-2" placeholder="Device name" value={deviceForm.name} onChange={(event) => setDeviceForm((current) => ({ ...current, name: event.target.value }))} disabled={!canManageAssets} />
            <input className="rounded-md border border-slate-300 px-3 py-2" placeholder="IP address" value={deviceForm.ipAddress} onChange={(event) => setDeviceForm((current) => ({ ...current, ipAddress: event.target.value }))} disabled={!canManageAssets} />
            <select className="rounded-md border border-slate-300 px-3 py-2" value={deviceForm.protocol} onChange={(event) => setDeviceForm((current) => ({ ...current, protocol: event.target.value as typeof deviceForm.protocol }))} disabled={!canManageAssets}>
              <option value="ModbusTCP">ModbusTCP</option>
              <option value="ModbusRTU">ModbusRTU</option>
              <option value="EthernetIP">EthernetIP</option>
              <option value="OPC-UA">OPC-UA</option>
            </select>
            <div className="grid gap-3 sm:grid-cols-2">
              <input className="rounded-md border border-slate-300 px-3 py-2" placeholder="Port" type="number" value={deviceForm.port} onChange={(event) => setDeviceForm((current) => ({ ...current, port: Number(event.target.value) }))} disabled={!canManageAssets} />
              <input className="rounded-md border border-slate-300 px-3 py-2" placeholder="Modbus address" type="number" value={deviceForm.modbusAddress} onChange={(event) => setDeviceForm((current) => ({ ...current, modbusAddress: Number(event.target.value) }))} disabled={!canManageAssets} />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <input className="rounded-md border border-slate-300 px-3 py-2" placeholder="Communication type" value={deviceForm.communicationType} onChange={(event) => setDeviceForm((current) => ({ ...current, communicationType: event.target.value }))} disabled={!canManageAssets} />
              <input className="rounded-md border border-slate-300 px-3 py-2" placeholder="Polling interval" type="number" value={deviceForm.pollingInterval} onChange={(event) => setDeviceForm((current) => ({ ...current, pollingInterval: Number(event.target.value) }))} disabled={!canManageAssets} />
            </div>
            <button className="min-h-11 rounded-md bg-teal-700 px-4 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60" type="submit" disabled={!canManageAssets}>Save device</button>
          </form>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <CalendarClock className="h-5 w-5 text-teal-700" />
            <h2 className="text-xl font-semibold text-slate-900">Maintenance history</h2>
          </div>
          <div className="space-y-3">
            {maintenanceRecords.length === 0 ? (
              <div className="rounded-md border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">No maintenance records for this asset yet.</div>
            ) : maintenanceRecords.map((record) => (
              <div key={record.id} className="rounded-lg border border-slate-200 p-3">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-900">{record.technician}</p>
                    <p className="text-sm text-slate-500">Next: {formatDate(record.nextMaintenanceDate)}</p>
                  </div>
                  <span className="rounded-full bg-teal-50 px-2.5 py-1 text-xs font-semibold uppercase text-teal-700">{record.status}</span>
                </div>
                <p className="mt-2 text-sm text-slate-600">Last service: {formatDate(record.lastServiceDate)} • Warranty: {formatDate(record.warrantyUntil)}</p>
                {record.notes ? <p className="mt-2 text-sm text-slate-600">{record.notes}</p> : null}
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          {!canManageAssets ? (
            <div className="mb-4 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">Operators can review maintenance history here, but changes are disabled.</div>
          ) : null}

          <div className="mb-4 flex items-center gap-2">
            <Plus className="h-5 w-5 text-teal-700" />
            <h2 className="text-xl font-semibold text-slate-900">Add maintenance</h2>
          </div>

          <form className="grid gap-3" onSubmit={handleCreateMaintenance}>
            <input className="rounded-md border border-slate-300 px-3 py-2" placeholder="Technician" value={maintenanceForm.technician} onChange={(event) => setMaintenanceForm((current) => ({ ...current, technician: event.target.value }))} disabled={!canManageAssets} />
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="grid gap-1 text-xs font-semibold uppercase text-slate-500">
                Next maintenance
                <input className="rounded-md border border-slate-300 px-3 py-2 text-base font-normal normal-case text-slate-950" type="date" value={maintenanceForm.nextMaintenanceDate} onChange={(event) => setMaintenanceForm((current) => ({ ...current, nextMaintenanceDate: event.target.value }))} disabled={!canManageAssets} />
              </label>
              <label className="grid gap-1 text-xs font-semibold uppercase text-slate-500">
                Last service
                <input className="rounded-md border border-slate-300 px-3 py-2 text-base font-normal normal-case text-slate-950" type="date" value={maintenanceForm.lastServiceDate} onChange={(event) => setMaintenanceForm((current) => ({ ...current, lastServiceDate: event.target.value }))} disabled={!canManageAssets} />
              </label>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <input className="rounded-md border border-slate-300 px-3 py-2" type="date" value={maintenanceForm.lastInspectionDate} onChange={(event) => setMaintenanceForm((current) => ({ ...current, lastInspectionDate: event.target.value }))} disabled={!canManageAssets} />
              <input className="rounded-md border border-slate-300 px-3 py-2" type="date" value={maintenanceForm.warrantyUntil} onChange={(event) => setMaintenanceForm((current) => ({ ...current, warrantyUntil: event.target.value }))} disabled={!canManageAssets} />
            </div>
            <textarea className="min-h-20 rounded-md border border-slate-300 px-3 py-2" placeholder="Notes" value={maintenanceForm.notes} onChange={(event) => setMaintenanceForm((current) => ({ ...current, notes: event.target.value }))} disabled={!canManageAssets} />
            <button className="min-h-11 rounded-md bg-teal-700 px-4 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60" type="submit" disabled={!canManageAssets}>Save maintenance</button>
          </form>
        </div>
      </div>
    </section>
  )
}
