import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import { api, setApiAdminToken } from '../api'
import type { User } from '../types'

interface AuthCtx {
  user: User | null
  adminToken: string | null
  isAdmin: boolean
  login: (userId: string, password: string, adminToken?: string) => Promise<User>
  logout: () => void
  updateUserLocation: (location: string) => void
}

const Ctx = createContext<AuthCtx>(null!)

const KEY = 'qr_door_session'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [adminToken, setAdminToken] = useState<string | null>(null)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY)
      if (!raw) return
      const s = JSON.parse(raw) as { user: User; adminToken: string | null }
      setUser(s.user)
      setAdminToken(s.adminToken)
      setApiAdminToken(s.adminToken)
    } catch {
      localStorage.removeItem(KEY)
    }
  }, [])

  const login = useCallback(async (userId: string, password: string, token?: string): Promise<User> => {
    if (token) setApiAdminToken(token)
    const data = await api.login(userId, password)
    const u: User = { user_id: data.user_id, name: data.name, privileges: data.privileges, location: data.location }
    const tok = token ?? null
    setUser(u)
    setAdminToken(tok)
    localStorage.setItem(KEY, JSON.stringify({ user: u, adminToken: tok }))
    return u
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    setAdminToken(null)
    setApiAdminToken(null)
    localStorage.removeItem(KEY)
  }, [])

  const updateUserLocation = useCallback((location: string) => {
    setUser(prev => {
      if (!prev) return prev
      const next = { ...prev, location }
      const raw = localStorage.getItem(KEY)
      if (raw) {
        const s = JSON.parse(raw) as { user: User; adminToken: string | null }
        localStorage.setItem(KEY, JSON.stringify({ ...s, user: next }))
      }
      return next
    })
  }, [])

  return (
    <Ctx.Provider value={{ user, adminToken, isAdmin: user?.privileges === 'admin', login, logout, updateUserLocation }}>
      {children}
    </Ctx.Provider>
  )
}

export const useAuth = () => useContext(Ctx)
