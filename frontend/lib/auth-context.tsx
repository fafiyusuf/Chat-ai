"use client"

import { createContext, ReactNode, useContext, useEffect, useState } from 'react'
import { authApi, clearTokens, getAccessToken } from './api'
import { disconnectSocket, initSocket } from './socket'

interface User {
  id: string
  email: string
  displayName: string | null
  username: string | null
  avatarUrl: string | null
  status: 'ONLINE' | 'OFFLINE' | 'AWAY' | 'BUSY'
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  loginWithOAuth: (user: User, accessToken: string, refreshToken: string) => void
  register: (email: string, password: string, displayName: string, username?: string) => Promise<void>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    const token = getAccessToken()
    if (!token) {
      setIsLoading(false)
      return
    }

    try {
      const data = await authApi.getProfile()
      setUser(data.user)
      // Initialize socket connection
      try {
        initSocket()
      } catch (e) {
        console.error('Socket init error:', e)
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      clearTokens()
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    const data = await authApi.login(email, password)
    setUser(data.user)
    // Initialize socket after login
    try {
      initSocket()
    } catch (e) {
      console.error('Socket init error:', e)
    }
  }

  const loginWithOAuth = (user: User, accessToken: string, refreshToken: string) => {
    // Tokens are already stored by the callback page
    setUser(user)
    // Initialize socket after OAuth login
    try {
      initSocket()
    } catch (e) {
      console.error('Socket init error:', e)
    }
  }

  const register = async (email: string, password: string, displayName: string, username?: string) => {
    const data = await authApi.register(email, password, displayName, username)
    setUser(data.user)
    // Initialize socket after registration
    try {
      initSocket()
    } catch (e) {
      console.error('Socket init error:', e)
    }
  }

  const logout = async () => {
    await authApi.logout()
    disconnectSocket()
    setUser(null)
  }

  const refreshUser = async () => {
    try {
      const data = await authApi.getProfile()
      setUser(data.user)
    } catch (error) {
      console.error('Failed to refresh user:', error)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        loginWithOAuth,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
