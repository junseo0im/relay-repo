"use client"

import { createContext, useContext, useState, useCallback, type ReactNode } from "react"

interface User {
  id: string
  name: string
  email: string
  avatar?: string
}

interface AuthContextType {
  user: User | null
  isLoggedIn: boolean
  login: (email: string, password: string) => Promise<void>
  signup: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
  showLoginModal: boolean
  setShowLoginModal: (show: boolean) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [showLoginModal, setShowLoginModal] = useState(false)

  const login = useCallback(async (email: string, _password: string) => {
    // Simulated login - in production, this would call an API
    await new Promise(resolve => setTimeout(resolve, 500))
    setUser({
      id: "1",
      name: email.split("@")[0],
      email,
      avatar: undefined
    })
    setShowLoginModal(false)
  }, [])

  const signup = useCallback(async (name: string, email: string, _password: string) => {
    // Simulated signup - in production, this would call an API
    await new Promise(resolve => setTimeout(resolve, 500))
    setUser({
      id: "1",
      name,
      email,
      avatar: undefined
    })
    setShowLoginModal(false)
  }, [])

  const logout = useCallback(() => {
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoggedIn: !!user,
        login,
        signup,
        logout,
        showLoginModal,
        setShowLoginModal
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
