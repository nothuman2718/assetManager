import { Boxes, LayoutDashboard, LogOut, ShieldCheck, Users } from 'lucide-react'
import { Link, Outlet } from 'react-router-dom'

import { useAuth } from '../features/auth/AuthContext'

export const AppShell = () => {
  const { logoutUser, user } = useAuth()

  const navItems = [
    { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
    { label: 'API Health', to: '/health', icon: ShieldCheck },
    ...(user?.role === 'Admin'
      ? [{ label: 'Users', to: '/users', icon: Users }]
      : []),
  ]

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950 md:grid md:grid-cols-[260px_1fr]">
      <aside className="bg-slate-950 px-5 py-6 text-white">
        <div className="flex min-h-10 items-center gap-2.5 text-lg font-bold">
          <Boxes className="h-6 w-6 text-teal-300" aria-hidden="true" />
          <span>EMS Registry</span>
        </div>

        <div className="mt-6 rounded-md border border-slate-800 bg-slate-900 p-3">
          <p className="text-sm font-semibold">{user?.name}</p>
          <p className="mt-1 text-xs text-slate-400">{user?.email}</p>
          <span className="mt-3 inline-flex rounded bg-teal-400/10 px-2 py-1 text-xs font-semibold text-teal-200">
            {user?.role}
          </span>
        </div>

        <nav
          className="mt-8 grid gap-2 sm:grid-cols-2 md:grid-cols-1"
          aria-label="Primary navigation"
        >
          {navItems.map((item) => (
            <Link
              className="flex min-h-10 items-center gap-2 rounded-md px-3 text-slate-200 hover:bg-slate-800 hover:text-white"
              key={item.to}
              to={item.to}
            >
              <item.icon className="h-4 w-4" aria-hidden="true" />
              {item.label}
            </Link>
          ))}
        </nav>

        <button
          className="mt-8 flex min-h-10 w-full items-center gap-2 rounded-md border border-slate-800 px-3 text-left text-slate-200 hover:bg-slate-800 hover:text-white"
          type="button"
          onClick={() => void logoutUser()}
        >
          <LogOut className="h-4 w-4" aria-hidden="true" />
          Logout
        </button>
      </aside>

      <main className="p-5 md:p-8">
        <Outlet />
      </main>
    </div>
  )
}
