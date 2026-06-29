import { apiRequest } from '../../services/api'
import type { AuthUser, LoginResponse } from '../../types/auth'

export const login = (email: string, password: string) =>
  apiRequest<LoginResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })

export const getCurrentUser = (token: string) =>
  apiRequest<AuthUser>('/auth/me', {
    token,
  })

export const logout = (token: string | null) =>
  apiRequest<{ success: boolean }>('/auth/logout', {
    method: 'POST',
    token,
  }).catch(() => ({ success: true }))
