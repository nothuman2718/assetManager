import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

import type { AuthUser } from '../../types/auth'
import { getCurrentUser, login, logout } from './auth-service'
import { authStorage } from './auth-storage'

type AuthContextValue = {
  user: AuthUser | null
  token: string | null
  isCheckingAuth: boolean
  isAuthenticated: boolean
  loginWithPassword: (email: string, password: string) => Promise<void>
  logoutUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(() => authStorage.getToken())
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)

  useEffect(() => {
    let isMounted = true

    const loadUser = async () => {
      if (!token) {
        setIsCheckingAuth(false)
        return
      }

      try {
        const currentUser = await getCurrentUser(token)

        if (isMounted) {
          setUser(currentUser)
        }
      } catch {
        authStorage.clearToken()

        if (isMounted) {
          setToken(null)
          setUser(null)
        }
      } finally {
        if (isMounted) {
          setIsCheckingAuth(false)
        }
      }
    }

    void loadUser()

    return () => {
      isMounted = false
    }
  }, [token])

  const loginWithPassword = useCallback(async (email: string, password: string) => {
    const result = await login(email, password)
    authStorage.setToken(result.token)
    setToken(result.token)
    setUser(result.user)
  }, [])

  const logoutUser = useCallback(async () => {
    await logout(token)
    authStorage.clearToken()
    setToken(null)
    setUser(null)
  }, [token])

  const value = useMemo(
    () => ({
      user,
      token,
      isCheckingAuth,
      isAuthenticated: Boolean(user && token),
      loginWithPassword,
      logoutUser,
    }),
    [isCheckingAuth, loginWithPassword, logoutUser, token, user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider')
  }

  return context
}
