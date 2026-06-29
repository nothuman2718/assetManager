import { Activity, AlertTriangle, Boxes, Building2, Cpu, Factory, Gauge, Wrench } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

import { useAuth } from '../auth/AuthContext'
import { dashboardApi } from './api'
import type { DashboardBucket, DashboardData, DashboardSummary } from './types'

const emptySummary: DashboardSummary = {
  totalPlants: 0,
  totalBuildings: 0,
  totalAssets: 0,
  totalDevices: 0,
  onlineDevices: 0,
  offlineDevices: 0,
  maintenanceDue: 0,
  upcomingMaintenance: 0,
  overdueMaintenance: 0,
}

const chartColors = ['#0f766e', '#2563eb', '#ca8a04', '#dc2626', '#64748b', '#7c3aed']

const StatCard = ({
  label,
  value,
  icon: Icon,
  tone = 'slate',
}: {
  label: string
  value: number
  icon: typeof Boxes
  tone?: 'slate' | 'teal' | 'red'
}) => {
  const toneClass = {
    slate: 'bg-slate-50 text-slate-700',
    teal: 'bg-teal-50 text-teal-700',
    red: 'bg-red-50 text-red-700',
  }[tone]

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-slate-500">{label}</p>
        <span className={`grid h-9 w-9 place-items-center rounded-md ${toneClass}`}>
          <Icon className="h-5 w-5" />
        </span>
      </div>
      <p className="mt-3 text-3xl font-bold text-slate-950">{value}</p>
    </div>
  )
}

const EmptyChart = () => (
  <div className="grid h-64 place-items-center rounded-md border border-slate-200 bg-slate-50 text-sm text-slate-600">
    No chart data yet.
  </div>
)

const hasChartData = (data: DashboardBucket[]) => data.some((item) => item.count > 0)

export const DashboardPage = () => {
  const { token, user } = useAuth()
  const [data, setData] = useState<DashboardData>({
    summary: emptySummary,
    assetsByCategory: [],
    deviceStatus: [],
    maintenance: { upcoming: 0, overdue: 0, byStatus: [] },
    recentAssets: [],
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadDashboard = useCallback(async () => {
    if (!token) {
      return
    }

    try {
      setLoading(true)
      setError(null)
      const [summary, assetsByCategory, deviceStatus, maintenance, recentAssets] = await Promise.all([
        dashboardApi.summary(token),
        dashboardApi.assetsByCategory(token),
        dashboardApi.deviceStatus(token),
        dashboardApi.maintenance(token),
        dashboardApi.recentAssets(token),
      ])

      setData({ summary, assetsByCategory, deviceStatus, maintenance, recentAssets })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard')
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    void loadDashboard()
  }, [loadDashboard])

  return (
    <section className="space-y-6">
      <div className="rounded-lg border border-slate-200 bg-white p-7 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Phase 7 dashboard</p>
            <h1 className="text-3xl font-bold text-slate-950">Welcome, {user?.name}</h1>
          </div>
          <button className="inline-flex min-h-10 items-center gap-2 rounded-md border border-slate-200 px-3 text-sm font-semibold text-slate-700 hover:bg-slate-50" type="button" onClick={() => void loadDashboard()}>
            <Activity className="h-4 w-4" />
            Refresh
          </button>
        </div>
        <p className="mt-4 max-w-3xl text-slate-600">
          Monitor hierarchy coverage, inventory totals, device health, and maintenance due dates from one operational view.
        </p>
      </div>

      {error ? <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div> : null}

      {loading ? (
        <div className="rounded-lg border border-slate-200 bg-white p-6 text-sm text-slate-600">Loading dashboard...</div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Plants" value={data.summary.totalPlants} icon={Factory} />
            <StatCard label="Buildings" value={data.summary.totalBuildings} icon={Building2} />
            <StatCard label="Assets" value={data.summary.totalAssets} icon={Boxes} tone="teal" />
            <StatCard label="Devices" value={data.summary.totalDevices} icon={Cpu} />
            <StatCard label="Online devices" value={data.summary.onlineDevices} icon={Gauge} tone="teal" />
            <StatCard label="Offline devices" value={data.summary.offlineDevices} icon={AlertTriangle} tone="red" />
            <StatCard label="Maintenance due" value={data.summary.maintenanceDue} icon={Wrench} tone={data.summary.maintenanceDue > 0 ? 'red' : 'slate'} />
            <StatCard label="Upcoming maintenance" value={data.summary.upcomingMaintenance} icon={Wrench} />
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="mb-4 text-xl font-semibold text-slate-900">Assets by category</h2>
              {hasChartData(data.assetsByCategory) ? (
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={data.assetsByCategory}>
                    <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#0f766e" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : <EmptyChart />}
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="mb-4 text-xl font-semibold text-slate-900">Device status</h2>
              {hasChartData(data.deviceStatus) ? (
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie data={data.deviceStatus} dataKey="count" nameKey="label" outerRadius={92} label>
                      {data.deviceStatus.map((entry, index) => (
                        <Cell key={entry.label} fill={chartColors[index % chartColors.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : <EmptyChart />}
            </div>
          </div>

          <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
            <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="mb-4 text-xl font-semibold text-slate-900">Maintenance due</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm font-semibold text-slate-500">Next 30 days</p>
                  <p className="mt-2 text-3xl font-bold text-slate-950">{data.maintenance.upcoming}</p>
                </div>
                <div className="rounded-md border border-red-100 bg-red-50 p-4">
                  <p className="text-sm font-semibold text-red-700">Overdue</p>
                  <p className="mt-2 text-3xl font-bold text-red-700">{data.maintenance.overdue}</p>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                {data.maintenance.byStatus.map((item) => (
                  <div className="flex items-center justify-between rounded-md border border-slate-200 px-3 py-2 text-sm" key={item.label}>
                    <span className="font-semibold capitalize text-slate-700">{item.label}</span>
                    <span className="text-slate-600">{item.count}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="mb-4 text-xl font-semibold text-slate-900">Recent assets</h2>
              {data.recentAssets.length === 0 ? (
                <div className="rounded-md border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">No assets have been created yet.</div>
              ) : (
                <div className="space-y-3">
                  {data.recentAssets.map((asset) => (
                    <div className="rounded-lg border border-slate-200 p-3" key={asset.id}>
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-slate-900">{asset.name}</p>
                          <p className="text-sm text-slate-500">{asset.code} • {asset.category}</p>
                        </div>
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold uppercase text-slate-700">{asset.status}</span>
                      </div>
                      <Link className="mt-3 inline-flex text-sm font-semibold text-teal-700 hover:text-teal-800" to={`/assets/${asset.id}`}>
                        View asset
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </section>
  )
}
