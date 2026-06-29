import { Mail, Settings, ShieldCheck, UserRound } from 'lucide-react'

import { Badge, Card, PageHeader } from '../../components/ui'
import { useAuth } from '../auth/AuthContext'

export const SettingsPage = () => {
  const { user } = useAuth()
  const canManage = user?.role !== 'Operator'

  return (
    <section className="space-y-6">
      <PageHeader
        eyebrow="Profile and settings"
        title="Settings"
        description="Review the current profile and application permissions. Full preference management can build from this placeholder later."
        action={<Badge tone={canManage ? 'teal' : 'amber'}>{canManage ? 'Management access' : 'Read only'}</Badge>}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-5">
          <div className="mb-4 flex items-center gap-2">
            <UserRound className="h-5 w-5 text-teal-700" />
            <h2 className="text-xl font-semibold text-slate-900">Profile</h2>
          </div>
          <div className="space-y-3 text-sm text-slate-700">
            <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
              <p className="text-xs font-bold uppercase text-slate-500">Name</p>
              <p className="mt-1 font-semibold text-slate-950">{user?.name}</p>
            </div>
            <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
              <p className="flex items-center gap-2 text-xs font-bold uppercase text-slate-500">
                <Mail className="h-4 w-4" />
                Email
              </p>
              <p className="mt-1 break-all font-semibold text-slate-950">{user?.email}</p>
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <div className="mb-4 flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-teal-700" />
            <h2 className="text-xl font-semibold text-slate-900">Permissions</h2>
          </div>
          <div className="space-y-3 text-sm text-slate-700">
            <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
              <p className="text-xs font-bold uppercase text-slate-500">Role</p>
              <div className="mt-2"><Badge tone="teal">{user?.role}</Badge></div>
            </div>
            <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
              <p className="text-xs font-bold uppercase text-slate-500">Access mode</p>
              <p className="mt-1 font-semibold text-slate-950">
                {canManage ? 'Create and update operational records' : 'View dashboards, hierarchy, assets, devices, and maintenance'}
              </p>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-5">
        <div className="flex items-center gap-2">
          <Settings className="h-5 w-5 text-teal-700" />
          <h2 className="text-xl font-semibold text-slate-900">Application settings</h2>
        </div>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
          Global settings are intentionally parked for now. Backend role checks remain the source of truth, while this page gives every role a stable destination for profile and permission context.
        </p>
      </Card>
    </section>
  )
}
