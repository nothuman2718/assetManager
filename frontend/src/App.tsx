import { Activity, Users } from 'lucide-react'
import { Navigate, Route, Routes } from 'react-router-dom'

import { AppShell } from './app/AppShell'
import { Badge, Card, PageHeader } from './components/ui'
import { LoginPage } from './features/auth/LoginPage'
import { ProtectedRoute } from './features/auth/ProtectedRoute'
import { AssetDetailPage } from './features/assets/AssetDetailPage'
import { AssetsPage } from './features/assets/AssetsPage'
import { DevicesPage } from './features/assets/DevicesPage'
import { DashboardPage } from './features/dashboard/DashboardPage'
import { HierarchyPage } from './features/hierarchy/HierarchyPage'
import { MaintenancePage } from './features/maintenance/MaintenancePage'
import { SettingsPage } from './features/settings/SettingsPage'

const HealthPage = () => (
  <section className="space-y-6">
    <PageHeader
      eyebrow="Backend contract"
      title="Health endpoint"
      description="The backend health route verifies that the API is reachable before feature modules are used."
      action={<Badge tone="teal">GET /api/health</Badge>}
    />
    <Card className="p-5">
      <div className="flex items-center gap-3">
        <Activity className="h-6 w-6 text-teal-700" aria-hidden="true" />
        <code className="rounded bg-slate-100 px-2 py-1 text-sm font-semibold text-slate-950">GET /api/health</code>
      </div>
    </Card>
  </section>
)

const UsersPage = () => (
  <section className="space-y-6">
    <PageHeader
      eyebrow="Admin only"
      title="Users"
      description="The backend user management route is protected for Admin users. Full user management screens can expand from this placeholder later."
      action={<Badge tone="teal">Admin</Badge>}
    />
    <Card className="p-5">
      <div className="flex items-center gap-3">
        <Users className="h-6 w-6 text-teal-700" aria-hidden="true" />
        <p className="text-sm text-slate-600">User management placeholder</p>
      </div>
    </Card>
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
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Route>
    </Routes>
  )
}

export default App
