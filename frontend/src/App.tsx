import { Activity, Boxes, LayoutDashboard } from 'lucide-react'
import { Link, Navigate, Route, Routes } from 'react-router-dom'

const DashboardPlaceholder = () => (
  <section className="max-w-4xl rounded-lg border border-slate-200 bg-white p-7 shadow-sm">
    <div className="mb-5 flex items-center gap-4">
      <LayoutDashboard className="h-8 w-8 text-teal-700" aria-hidden="true" />
      <div>
        <p className="mb-1 text-xs font-bold uppercase text-slate-500">
          Phase 1 scaffold
        </p>
        <h1 className="text-3xl font-bold text-slate-950">
          EMS Asset Registry
        </h1>
      </div>
    </div>
    <p className="max-w-2xl leading-7 text-slate-600">
      The React app shell is ready for the asset configuration platform. Phase 2
      will replace this placeholder with authentication and protected routes.
    </p>
  </section>
)

const HealthPlaceholder = () => (
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

function App() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-950 md:grid md:grid-cols-[260px_1fr]">
      <aside className="bg-slate-950 px-5 py-6 text-white">
        <div className="flex min-h-10 items-center gap-2.5 text-lg font-bold">
          <Boxes className="h-6 w-6 text-teal-300" aria-hidden="true" />
          <span>EMS Registry</span>
        </div>
        <nav
          className="mt-8 grid gap-2 sm:grid-cols-2 md:grid-cols-1"
          aria-label="Primary navigation"
        >
          <Link
            className="flex min-h-10 items-center rounded-md px-3 text-slate-200 hover:bg-slate-800 hover:text-white"
            to="/dashboard"
          >
            Dashboard
          </Link>
          <Link
            className="flex min-h-10 items-center rounded-md px-3 text-slate-200 hover:bg-slate-800 hover:text-white"
            to="/health"
          >
            API Health
          </Link>
        </nav>
      </aside>

      <main className="p-5 md:p-8">
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPlaceholder />} />
          <Route path="/health" element={<HealthPlaceholder />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
