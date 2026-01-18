"use client"

import { createContext, ReactNode, useContext, useEffect, useState } from 'react'
import { authApi, getAccessToken, getRefreshToken } from './api'
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
    const refreshTokenValue = getRefreshToken()
    
    console.log('CheckAuth: accessToken exists:', !!token, 'refreshToken exists:', !!refreshTokenValue)
    
    // Only proceed if we have at least one token
    if (!token && !refreshTokenValue) {
      console.log('CheckAuth: No tokens found, setting loading false')
      setIsLoading(false)
      return
    }

    // Try up to 2 times (initial + 1 retry after potential refresh)
    let attempts = 0
    const maxAttempts = 2
    
    while (attempts < maxAttempts) {
      attempts++
      try {
        console.log(`CheckAuth: Attempt ${attempts} to get profile`)
        const data = await authApi.getProfile()
        // Backend returns user object directly, not wrapped in { user: ... }
        const userData = data.user || data
        console.log('CheckAuth: Profile fetched successfully', userData?.email)
        setUser(userData)
        // Initialize socket connection
        try {
          initSocket()
        } catch (e) {
          console.error('Socket init error:', e)
        }
        setIsLoading(false)
        return // Success, exit
      } catch (error) {
        console.error(`Auth check attempt ${attempts} failed:`, error)
        
        // Check if we still have tokens after this attempt
        const stillHasRefreshToken = getRefreshToken()
        const stillHasAccessToken = getAccessToken()
        console.log('CheckAuth: After error - accessToken:', !!stillHasAccessToken, 'refreshToken:', !!stillHasRefreshToken)
        
        // If no tokens left, break out
        if (!stillHasRefreshToken && !stillHasAccessToken) {
          console.log('CheckAuth: No tokens remaining, user logged out')
          break
        }
        
        // If this was the last attempt, break
        if (attempts >= maxAttempts) {
          console.log('CheckAuth: Max attempts reached')
          break
        }
        
        // Wait a bit before retry
        await new Promise(resolve => setTimeout(resolve, 500))
      }
    }
    
    setIsLoading(false)
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
