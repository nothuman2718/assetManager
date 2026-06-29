import type { ComponentType, ReactNode } from 'react'

type IconComponent = ComponentType<{ className?: string; 'aria-hidden'?: boolean }>

export const Card = ({ children, className = '' }: { children: ReactNode; className?: string }) => (
  <section className={`rounded-lg border border-slate-200 bg-white shadow-sm ${className}`}>
    {children}
  </section>
)

export const Badge = ({
  children,
  tone = 'slate',
}: {
  children: ReactNode
  tone?: 'slate' | 'teal' | 'green' | 'amber' | 'red'
}) => {
  const toneClass = {
    slate: 'bg-slate-100 text-slate-700',
    teal: 'bg-teal-50 text-teal-700',
    green: 'bg-emerald-50 text-emerald-700',
    amber: 'bg-amber-50 text-amber-700',
    red: 'bg-red-50 text-red-700',
  }[tone]

  return (
    <span className={`inline-flex rounded px-2.5 py-1 text-xs font-semibold uppercase ${toneClass}`}>
      {children}
    </span>
  )
}

export const Button = ({
  children,
  icon: Icon,
  variant = 'secondary',
  className = '',
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  icon?: IconComponent
  variant?: 'primary' | 'secondary' | 'danger'
}) => {
  const variantClass = {
    primary: 'border-teal-700 bg-teal-700 text-white hover:bg-teal-800',
    secondary: 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50',
    danger: 'border-red-200 bg-red-50 text-red-700 hover:bg-red-100',
  }[variant]

  return (
    <button
      className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-md border px-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60 ${variantClass} ${className}`}
      type="button"
      {...props}
    >
      {Icon ? <Icon className="h-4 w-4" aria-hidden /> : null}
      {children}
    </button>
  )
}

export const PageHeader = ({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string
  title: string
  description?: string
  action?: ReactNode
}) => (
  <Card className="p-7">
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">{eyebrow}</p>
        <h1 className="mt-1 text-3xl font-bold text-slate-950">{title}</h1>
      </div>
      {action}
    </div>
    {description ? <p className="mt-4 max-w-3xl text-slate-600">{description}</p> : null}
  </Card>
)

export const LoadingState = ({ label = 'Loading...' }: { label?: string }) => (
  <div className="rounded-md border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
    {label}
  </div>
)

export const EmptyState = ({ label }: { label: string }) => (
  <div className="rounded-md border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
    {label}
  </div>
)

export const ErrorState = ({ message }: { message: string }) => (
  <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
    {message}
  </div>
)

export const Field = ({
  label,
  children,
}: {
  label: string
  children: ReactNode
}) => (
  <label className="grid gap-1 text-xs font-semibold uppercase text-slate-500">
    {label}
    {children}
  </label>
)

export const DataTable = <T,>({
  rows,
  columns,
  getKey,
  emptyLabel,
}: {
  rows: T[]
  columns: Array<{ header: string; render: (row: T) => ReactNode }>
  getKey: (row: T) => string
  emptyLabel: string
}) => {
  if (rows.length === 0) {
    return <EmptyState label={emptyLabel} />
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200">
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead className="bg-slate-50 text-left text-xs font-bold uppercase text-slate-500">
          <tr>
            {columns.map((column) => (
              <th className="px-3 py-3" key={column.header}>{column.header}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {rows.map((row) => (
            <tr key={getKey(row)}>
              {columns.map((column) => (
                <td className="px-3 py-3 text-slate-700" key={column.header}>{column.render(row)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export const SidePanel = ({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) => (
  <aside className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
    <h2 className="mb-4 text-xl font-semibold text-slate-900">{title}</h2>
    {children}
  </aside>
)
