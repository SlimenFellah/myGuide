import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { authService } from '@/services/authService'

type User = any

type AuthContextValue = {
  user: User | null
  initialized: boolean
  login: (email: string, password: string) => Promise<boolean>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    ;(async () => {
      const u = await authService.getUser()
      setUser(u)
      setInitialized(true)
    })()
  }, [])

  const login = async (email: string, password: string) => {
    const res = await authService.login(email, password)
    if (res.success) {
      const u = await authService.getUser()
      setUser(u)
      return true
    }
    return false
  }

  const logout = async () => {
    await authService.logout()
    setUser(null)
  }

  const value = useMemo(() => ({ user, initialized, login, logout }), [user, initialized])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('AuthContext not found')
  return ctx
}
