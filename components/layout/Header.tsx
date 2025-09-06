'use client'

import { useState } from 'react'
import { Bell, Search, Menu, User, LogIn, Heart } from 'lucide-react'
import { useAuth } from '@/components/providers/AuthProvider'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Alert, AlertDescription } from '@/components/ui/Alert'

export default function Header() {
  const { user, signOut, login } = useAuth()
  const [showLogin, setShowLogin] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const success = await login(email, password)
      
      if (success) {
        setShowLogin(false)
        setEmail('')
        setPassword('')
        window.location.href = '/dashboard'
      } else {
        setError('Credenciales inválidas. Verifica tu email y contraseña.')
      }
    } catch (error) {
      setError('Error al iniciar sesión. Inténtalo de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex items-center">
                <Heart className="w-8 h-8 text-primary-600 mr-2" />
                <h1 className="text-xl font-semibold text-gray-900">
                  MedControl
                </h1>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      placeholder="Buscar pacientes, citas..."
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    />
                  </div>

                  <button className="p-2 text-gray-400 hover:text-gray-500 relative">
                    <Bell className="w-6 h-6" />
                    <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-400 ring-2 ring-white"></span>
                  </button>

                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {user.full_name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {user.specialty}
                      </p>
                    </div>
                    <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-primary-600">
                        {user.full_name?.charAt(0) || 'U'}
                      </span>
                    </div>
                    <button
                      onClick={signOut}
                      className="text-sm text-gray-500 hover:text-gray-700"
                    >
                      Cerrar Sesión
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => setShowLogin(true)}
                    className="flex items-center space-x-2 text-primary-600 hover:text-primary-700 font-medium"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>Iniciar Sesión</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Modal de Login */}
      {showLogin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5 text-primary-600" />
                Iniciar Sesión
              </CardTitle>
              <CardDescription>
                Ingresa tus credenciales para acceder al sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                {error && (
                  <Alert className="border-red-200 bg-red-50">
                    <AlertDescription className="text-red-800">{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="doctor@medcontrol.com"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Contraseña</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                  />
                </div>

                <div className="flex space-x-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowLogin(false)}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="flex-1"
                  >
                    {loading ? 'Iniciando...' : 'Iniciar Sesión'}
                  </Button>
                </div>
              </form>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">Modo Demo</h4>
                <p className="text-sm text-blue-700">
                  Este es un sistema de demostración. Contacta al administrador para obtener acceso.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  )
}

