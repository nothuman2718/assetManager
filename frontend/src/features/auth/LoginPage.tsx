import { zodResolver } from '@hookform/resolvers/zod'
import { LockKeyhole } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { z } from 'zod'

import { useAuth } from './AuthContext'

const loginSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
})

type LoginFormValues = z.infer<typeof loginSchema>

const demoUsers = [
  { label: 'Admin', email: 'admin@ems.local', password: 'Admin@123' },
  { label: 'Engineer', email: 'engineer@ems.local', password: 'Engineer@123' },
  { label: 'Operator', email: 'operator@ems.local', password: 'Operator@123' },
]

export const LoginPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated, loginWithPassword } = useAuth()
  const [formError, setFormError] = useState<string | null>(null)

  const from = location.state?.from?.pathname ?? '/dashboard'

  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    setValue,
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: 'admin@ems.local',
      password: 'Admin@123',
    },
  })

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  const onSubmit = async (values: LoginFormValues) => {
    setFormError(null)

    try {
      await loginWithPassword(values.email, values.password)
      navigate(from, { replace: true })
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Login failed')
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-slate-100 px-4 py-10">
      <section className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-7 shadow-sm">
        <div className="mb-6 flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-md bg-teal-100 text-teal-700">
            <LockKeyhole className="h-6 w-6" aria-hidden="true" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase text-slate-500">
              EMS Registry
            </p>
            <h1 className="text-2xl font-bold text-slate-950">Sign in</h1>
          </div>
        </div>

        <form className="grid gap-4" onSubmit={handleSubmit(onSubmit)}>
          <label className="grid gap-1.5">
            <span className="text-sm font-semibold text-slate-700">Email</span>
            <input
              className="min-h-11 rounded-md border border-slate-300 px-3 outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
              type="email"
              autoComplete="email"
              {...register('email')}
            />
            {errors.email ? (
              <span className="text-sm text-red-600">{errors.email.message}</span>
            ) : null}
          </label>

          <label className="grid gap-1.5">
            <span className="text-sm font-semibold text-slate-700">
              Password
            </span>
            <input
              className="min-h-11 rounded-md border border-slate-300 px-3 outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
              type="password"
              autoComplete="current-password"
              {...register('password')}
            />
            {errors.password ? (
              <span className="text-sm text-red-600">
                {errors.password.message}
              </span>
            ) : null}
          </label>

          {formError ? (
            <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {formError}
            </div>
          ) : null}

          <button
            className="min-h-11 rounded-md bg-teal-700 px-4 font-semibold text-white hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-60"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <div className="mt-6 grid gap-2 border-t border-slate-200 pt-5">
          <p className="text-sm font-semibold text-slate-700">Demo logins</p>
          {demoUsers.map((demoUser) => (
            <button
              className="min-h-9 rounded-md border border-slate-200 px-3 text-left text-sm text-slate-600 hover:bg-slate-50"
              key={demoUser.email}
              type="button"
              onClick={() => {
                setValue('email', demoUser.email)
                setValue('password', demoUser.password)
              }}
            >
              {demoUser.label}: {demoUser.email}
            </button>
          ))}
        </div>
      </section>
    </main>
  )
}
