'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { useRouter } from 'next/navigation'
import { Trash2, ArrowRight, User, LogIn } from 'lucide-react'
import toast from 'react-hot-toast'

export default function TestLoginPage() {
  const router = useRouter()
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  const clearAll = () => {
    if (typeof window === 'undefined') return
    
    localStorage.clear()
    setIsLoggedIn(false)
    toast.success('localStorage limpiado completamente')
  }

  const simulateLogin = () => {
    if (typeof window === 'undefined') return
    
    const mockPatient = {
      id: 'test-patient-123',
      first_name: 'Juan',
      last_name: 'Pérez',
      email: 'juan.perez@example.com'
    }
    
    localStorage.setItem('medcontrol_patient', JSON.stringify(mockPatient))
    setIsLoggedIn(true)
    toast.success('Paciente simulado logueado')
  }

  const goToAgendar = () => {
    router.push('/agendar')
  }

  const goToLogin = () => {
    router.push('/paciente/login')
  }

  const goToRegister = () => {
    router.push('/registro')
  }

  // Verificar estado al cargar
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const patientData = localStorage.getItem('medcontrol_patient')
      const doctorData = localStorage.getItem('medcontrol_user')
      setIsLoggedIn(!!(patientData || doctorData))
    }
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🧪 Test de Login
          </h1>
          <p className="text-gray-600">
            Página simple para probar el flujo de autenticación
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Estado Actual</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-medium">Usuario Logueado:</span>
              <span className={`px-2 py-1 rounded text-sm ${
                isLoggedIn ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {isLoggedIn ? 'Sí' : 'No'}
              </span>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          {/* Acciones de Limpieza */}
          <Card>
            <CardHeader>
              <CardTitle>Limpiar</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                onClick={clearAll}
                className="w-full"
                variant="destructive"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Limpiar Todo
              </Button>
            </CardContent>
          </Card>

          {/* Acciones de Login */}
          <Card>
            <CardHeader>
              <CardTitle>Simular Login</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                onClick={simulateLogin}
                className="w-full"
                variant="outline"
              >
                <User className="w-4 h-4 mr-2" />
                Simular Paciente
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          {/* Navegación */}
          <Card>
            <CardHeader>
              <CardTitle>Navegación</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                onClick={goToAgendar}
                className="w-full"
              >
                <ArrowRight className="w-4 h-4 mr-2" />
                Ir a Agendar
              </Button>
              
              <Button
                onClick={goToLogin}
                className="w-full"
                variant="outline"
              >
                <LogIn className="w-4 h-4 mr-2" />
                Login Paciente
              </Button>
              
              <Button
                onClick={goToRegister}
                className="w-full"
                variant="outline"
              >
                <User className="w-4 h-4 mr-2" />
                Registro Paciente
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Instrucciones */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>📋 Instrucciones de Prueba</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-red-50 p-4 rounded-lg">
                <h3 className="font-semibold text-red-900 mb-2">❌ Prueba 1: Sin Login</h3>
                <ol className="text-sm text-red-800 space-y-1 list-decimal list-inside">
                  <li>Haz clic en "Limpiar Todo"</li>
                  <li>Verifica que "Usuario Logueado" muestre "No"</li>
                  <li>Haz clic en "Ir a Agendar"</li>
                  <li>Debería mostrar el prompt de login/registro</li>
                </ol>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-semibold text-green-900 mb-2">✅ Prueba 2: Con Login</h3>
                <ol className="text-sm text-green-800 space-y-1 list-decimal list-inside">
                  <li>Haz clic en "Simular Paciente"</li>
                  <li>Verifica que "Usuario Logueado" muestre "Sí"</li>
                  <li>Haz clic en "Ir a Agendar"</li>
                  <li>Debería mostrar el formulario de agendamiento</li>
                </ol>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


