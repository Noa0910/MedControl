'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { useRouter } from 'next/navigation'
import { Trash2, ArrowRight, User, LogIn, Calendar, Home, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'

export default function TestRedirectPage() {
  const router = useRouter()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [patientData, setPatientData] = useState<any>(null)

  const checkSession = () => {
    if (typeof window === 'undefined') return
    
    const patient = localStorage.getItem('medcontrol_patient')
    const doctor = localStorage.getItem('medcontrol_user')
    
    if (patient) {
      try {
        const parsedPatient = JSON.parse(patient)
        setPatientData(parsedPatient)
        setIsLoggedIn(true)
        console.log('✅ Paciente logueado:', parsedPatient)
      } catch (error) {
        console.error('Error parsing patient data:', error)
        setIsLoggedIn(false)
        setPatientData(null)
      }
    } else if (doctor) {
      try {
        const parsedDoctor = JSON.parse(doctor)
        setPatientData(parsedDoctor)
        setIsLoggedIn(true)
        console.log('✅ Doctor logueado:', parsedDoctor)
      } catch (error) {
        console.error('Error parsing doctor data:', error)
        setIsLoggedIn(false)
        setPatientData(null)
      }
    } else {
      setIsLoggedIn(false)
      setPatientData(null)
      console.log('❌ No hay usuario logueado')
    }
  }

  const clearSession = () => {
    if (typeof window === 'undefined') return
    
    localStorage.clear()
    setIsLoggedIn(false)
    setPatientData(null)
    toast.success('Sesión limpiada')
  }

  const simulatePatientLogin = () => {
    if (typeof window === 'undefined') return
    
    const mockPatient = {
      id: 'test-patient-123',
      first_name: 'Juan',
      last_name: 'Pérez',
      email: 'juan.perez@example.com'
    }
    
    localStorage.setItem('medcontrol_patient', JSON.stringify(mockPatient))
    checkSession()
    toast.success('Paciente simulado logueado')
  }

  const testRedirects = () => {
    toast.success('Probando redirecciones...')
    
    // Simular recarga de página
    setTimeout(() => {
      window.location.reload()
    }, 1000)
  }

  const goToAgendar = () => {
    router.push('/agendar')
  }

  const goToHome = () => {
    router.push('/')
  }

  const goToDashboard = () => {
    router.push('/paciente/dashboard')
  }

  // Verificar sesión al cargar
  useEffect(() => {
    checkSession()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-100 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🔄 Test de Redirección Automática
          </h1>
          <p className="text-gray-600">
            Prueba que los usuarios logueados sean redirigidos automáticamente
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Estado de Sesión */}
          <Card>
            <CardHeader>
              <CardTitle>Estado de Sesión</CardTitle>
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
              
              {patientData && (
                <div className="space-y-2">
                  <div className="font-medium">Datos del Usuario:</div>
                  <div className="text-sm bg-gray-100 p-2 rounded">
                    <div>ID: {patientData.id}</div>
                    <div>Nombre: {patientData.first_name} {patientData.last_name}</div>
                    <div>Email: {patientData.email}</div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Acciones de Sesión */}
          <Card>
            <CardHeader>
              <CardTitle>Acciones de Sesión</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                onClick={clearSession}
                className="w-full"
                variant="destructive"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Limpiar Sesión
              </Button>
              
              <Button
                onClick={simulatePatientLogin}
                className="w-full"
                variant="outline"
              >
                <User className="w-4 h-4 mr-2" />
                Simular Paciente
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Pruebas de Redirección */}
          <Card>
            <CardHeader>
              <CardTitle>Pruebas de Redirección</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                onClick={goToHome}
                className="w-full"
              >
                <Home className="w-4 h-4 mr-2" />
                Ir a Página Principal
              </Button>
              
              <Button
                onClick={goToAgendar}
                className="w-full"
                variant="outline"
              >
                <Calendar className="w-4 h-4 mr-2" />
                Ir a Agendar
              </Button>
              
              <Button
                onClick={testRedirects}
                className="w-full"
                variant="outline"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Probar Redirecciones
              </Button>
            </CardContent>
          </Card>

          {/* Navegación Directa */}
          <Card>
            <CardHeader>
              <CardTitle>Navegación Directa</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                onClick={goToDashboard}
                className="w-full"
                variant="outline"
              >
                <User className="w-4 h-4 mr-2" />
                Ir a Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Instrucciones */}
        <Card>
          <CardHeader>
            <CardTitle>📋 Instrucciones de Prueba</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-2">🔄 Prueba 1: Sin Sesión</h3>
                <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                  <li>Haz clic en "Limpiar Sesión"</li>
                  <li>Haz clic en "Ir a Página Principal"</li>
                  <li>Debería mostrar la página principal normal</li>
                  <li>Haz clic en "Ir a Agendar"</li>
                  <li>Debería mostrar el prompt de login/registro</li>
                </ol>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-semibold text-green-900 mb-2">✅ Prueba 2: Con Sesión</h3>
                <ol className="text-sm text-green-800 space-y-1 list-decimal list-inside">
                  <li>Haz clic en "Simular Paciente"</li>
                  <li>Haz clic en "Ir a Página Principal"</li>
                  <li>Debería redirigir automáticamente al dashboard</li>
                  <li>Haz clic en "Ir a Agendar"</li>
                  <li>Debería redirigir automáticamente al dashboard</li>
                </ol>
              </div>

              <div className="bg-purple-50 p-4 rounded-lg">
                <h3 className="font-semibold text-purple-900 mb-2">🔄 Prueba 3: Recarga de Página</h3>
                <ol className="text-sm text-purple-800 space-y-1 list-decimal list-inside">
                  <li>Haz clic en "Simular Paciente"</li>
                  <li>Haz clic en "Probar Redirecciones"</li>
                  <li>La página se recargará automáticamente</li>
                  <li>Debería mantener la sesión y redirigir al dashboard</li>
                </ol>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


