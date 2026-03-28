import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { api, clearTokens } from '../lib/axios'
import type { User } from '../types'

interface AuthContextValue {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (accessToken: string, refreshToken: string, user: User) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('accessToken')
    if (!token) {
      setIsLoading(false)
      return
    }
    api.get<{ success: boolean; data: { user: User } }>('/auth/me')
      .then(({ data }) => setUser(data.data.user))
      .catch(() => clearTokens())
      .finally(() => setIsLoading(false))
  }, [])

  function login(accessToken: string, refreshToken: string, userData: User) {
    localStorage.setItem('accessToken', accessToken)
    localStorage.setItem('refreshToken', refreshToken)
    setUser(userData)
  }

  function logout() {
    const refreshToken = localStorage.getItem('refreshToken')
    if (refreshToken) {
      api.post('/auth/logout', { refreshToken }).catch(() => {})
    }
    clearTokens()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, isAuthenticated: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
