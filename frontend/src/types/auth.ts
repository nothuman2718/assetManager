export type UserRole = 'Admin' | 'Engineer' | 'Operator'
export type UserStatus = 'active' | 'inactive' | 'deleted'

export type AuthUser = {
  id: string
  name: string
  email: string
  role: UserRole
  status: UserStatus
  lastLoginAt?: string
  createdAt: string
  updatedAt: string
}

export type LoginResponse = {
  token: string
  user: AuthUser
}
