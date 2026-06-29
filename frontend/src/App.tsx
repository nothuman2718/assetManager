import { Activity, LayoutDashboard, Users } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'

import { AppShell } from './app/AppShell'
import { LoginPage } from './features/auth/LoginPage'
import { ProtectedRoute } from './features/auth/ProtectedRoute'
import { useAuth } from './features/auth/AuthContext'
import { AssetDetailPage } from './features/assets/AssetDetailPage'
import { AssetsPage } from './features/assets/AssetsPage'
import { DevicesPage } from './features/assets/DevicesPage'
import { HierarchyPage } from './features/hierarchy/HierarchyPage'
import { MaintenancePage } from './features/maintenance/MaintenancePage'
import { maintenanceApi } from './features/maintenance/api'

const DashboardPage = () => {
  const { token, user } = useAuth()
  const [upcomingCount, setUpcomingCount] = useState(0)
  const [overdueCount, setOverdueCount] = useState(0)

  useEffect(() => {
    if (!token) {
      return
    }

    const loadMaintenanceSummary = async () => {
      const [upcoming, overdue] = await Promise.all([
        maintenanceApi.upcoming(token, 30),
        maintenanceApi.overdue(token),
      ])
      setUpcomingCount(upcoming.length)
      setOverdueCount(overdue.length)
    }

    void loadMaintenanceSummary()
  }, [token])

  return (
    <section className="max-w-4xl rounded-lg border border-slate-200 bg-white p-7 shadow-sm">
      <div className="mb-5 flex items-center gap-4">
        <LayoutDashboard className="h-8 w-8 text-teal-700" aria-hidden="true" />
        <div>
          <p className="mb-1 text-xs font-bold uppercase text-slate-500">
            Phase 2 auth ready
          </p>
          <h1 className="text-3xl font-bold text-slate-950">
            Welcome, {user?.name}
          </h1>
        </div>
      </div>
      <p className="max-w-2xl leading-7 text-slate-600">
        Authentication, protected routes, hierarchy, assets, devices, and maintenance workflows are active.
      </p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm font-semibold text-slate-500">Upcoming maintenance</p>
          <p className="mt-2 text-3xl font-bold text-slate-950">{upcomingCount}</p>
        </div>
        <div className="rounded-lg border border-red-100 bg-red-50 p-4">
          <p className="text-sm font-semibold text-red-700">Overdue maintenance</p>
          <p className="mt-2 text-3xl font-bold text-red-700">{overdueCount}</p>
        </div>
      </div>
    </section>
  )
}

const HealthPage = () => (
  <section className="max-w-4xl rounded-lg border border-slate-200 bg-white p-7 shadow-sm">
    <div className="mb-5 flex items-center gap-4">
      <Activity className="h-8 w-8 text-teal-700" aria-hidden="true" />
      <div>
        <p className="mb-1 text-xs font-bold uppercase text-slate-500">
          Backend contract
        </p>
        <h1 className="text-3xl font-bold text-slate-950">Health endpoint</h1>
      </div>
    </div>
    <p className="max-w-2xl leading-7 text-slate-600">
      The backend exposes{' '}
      <code className="rounded bg-slate-100 px-1.5 py-1 text-slate-950">
        GET /api/health
      </code>{' '}
      so setup can be verified before feature modules are added.
    </p>
  </section>
)

const UsersPage = () => (
  <section className="max-w-4xl rounded-lg border border-slate-200 bg-white p-7 shadow-sm">
    <div className="mb-5 flex items-center gap-4">
      <Users className="h-8 w-8 text-teal-700" aria-hidden="true" />
      <div>
        <p className="mb-1 text-xs font-bold uppercase text-slate-500">
          Admin only
        </p>
        <h1 className="text-3xl font-bold text-slate-950">Users</h1>
      </div>
    </div>
    <p className="max-w-2xl leading-7 text-slate-600">
      The backend user management route is protected for Admin users. Full user
      management screens can expand from this placeholder later.
    </p>
  </section>
)

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<AppShell />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/health" element={<HealthPage />} />
          <Route path="/users" element={<UsersPage />} />
          <Route path="/hierarchy" element={<HierarchyPage />} />
          <Route path="/assets" element={<AssetsPage />} />
          <Route path="/assets/:id" element={<AssetDetailPage />} />
          <Route path="/devices" element={<DevicesPage />} />
          <Route path="/maintenance" element={<MaintenancePage />} />
        </Route>
      </Route>
    </Routes>
  )
}

export default App
