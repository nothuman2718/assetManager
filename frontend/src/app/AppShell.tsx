import { Boxes, CalendarClock, Cpu, LayoutDashboard, LogOut, Settings, ShieldCheck, Trees, Users, Wrench } from 'lucide-react'
import { NavLink, Outlet } from 'react-router-dom'

import { Badge, Button } from '../components/ui'
import { useAuth } from '../features/auth/AuthContext'

export const AppShell = () => {
  const { logoutUser, user } = useAuth()

  const isOperator = user?.role === 'Operator'
  const navItems = [
    { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard, roles: ['Admin', 'Engineer', 'Operator'] },
    { label: 'Hierarchy', to: '/hierarchy', icon: Trees, roles: ['Admin', 'Engineer', 'Operator'] },
    { label: 'Assets', to: '/assets', icon: Wrench, roles: ['Admin', 'Engineer', 'Operator'] },
    { label: 'Devices', to: '/devices', icon: Cpu, roles: ['Admin', 'Engineer', 'Operator'] },
    { label: 'Maintenance', to: '/maintenance', icon: CalendarClock, roles: ['Admin', 'Engineer', 'Operator'] },
    { label: 'Settings', to: '/settings', icon: Settings, roles: ['Admin', 'Engineer', 'Operator'] },
    { label: 'API Health', to: '/health', icon: ShieldCheck, roles: ['Admin', 'Engineer'] },
    ...(user?.role === 'Admin'
      ? [{ label: 'Users', to: '/users', icon: Users, roles: ['Admin'] }]
      : []),
  ].filter((item) => user?.role && item.roles.includes(user.role))

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
          <div className="mt-3">
            <Badge tone="teal">{user?.role}</Badge>
          </div>
          {isOperator ? <p className="mt-3 text-xs leading-5 text-slate-400">Read-only workflows are enabled for this session.</p> : null}
        </div>

        <nav
          className="mt-8 grid gap-2 sm:grid-cols-2 md:grid-cols-1"
          aria-label="Primary navigation"
        >
          {navItems.map((item) => (
            <NavLink
              className={({ isActive }) =>
                `flex min-h-10 items-center gap-2 rounded-md px-3 text-sm font-semibold ${isActive ? 'bg-teal-500/15 text-teal-100' : 'text-slate-200 hover:bg-slate-800 hover:text-white'}`
              }
              key={item.to}
              to={item.to}
            >
              <item.icon className="h-4 w-4" aria-hidden="true" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <Button
          className="mt-8 w-full justify-start border-slate-800 bg-slate-950 text-slate-200 hover:bg-slate-800 hover:text-white"
          icon={LogOut}
          onClick={() => void logoutUser()}
        >
          Logout
        </Button>
      </aside>

      <div className="min-w-0">
        <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 px-5 py-4 backdrop-blur md:px-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-slate-500">EMS Asset Registry</p>
              <p className="text-lg font-bold text-slate-950">{user?.name}</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge tone={isOperator ? 'amber' : 'teal'}>{isOperator ? 'View only' : 'Manage'}</Badge>
              <Badge>{user?.role}</Badge>
            </div>
          </div>
        </header>

        <main className="p-5 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
