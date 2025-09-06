'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface User {
  email: string
  name: string
  full_name: string // Alias for name
  specialty?: string
  role: 'admin' | 'doctor'
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  signOut: () => void // Alias for logout
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check for stored user session
    const storedUser = localStorage.getItem('medcontrol_user')
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // Try MySQL authentication first
      try {
        const { apiClient } = await import('@/lib/api-client')
        const response = await apiClient.loginDoctor(email, password)
        
        if (response.success && response.doctor) {
          const userData: User = {
            email: response.doctor.email,
            name: response.doctor.full_name,
            full_name: response.doctor.full_name,
            specialty: response.doctor.specialty,
            role: response.doctor.role as 'admin' | 'doctor'
          }
          
          setUser(userData)
          localStorage.setItem('medcontrol_user', JSON.stringify(userData))
          return true
        }
      } catch (apiError) {
        console.log('MySQL authentication failed, trying demo credentials...')
      }

      // Fallback to demo credentials
      const { DEMO_CREDENTIALS, DEMO_DOCTORS } = await import('@/lib/demo-credentials')
      
      if (DEMO_CREDENTIALS[email as keyof typeof DEMO_CREDENTIALS] === password) {
        const doctor = DEMO_DOCTORS.find(d => d.email === email)
        const userData: User = {
          email,
          name: doctor?.name || 'Admin',
          full_name: doctor?.name || 'Admin',
          specialty: doctor?.specialty,
          role: email === 'admin@medcontrol.com' ? 'admin' : 'doctor'
        }
        
        setUser(userData)
        localStorage.setItem('medcontrol_user', JSON.stringify(userData))
        return true
      }
      return false
    } catch (error) {
      console.error('Login error:', error)
      return false
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('medcontrol_user')
    // Force redirect to home page
    window.location.href = '/'
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, signOut: logout, isLoading }}>
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