'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { useRouter } from 'next/navigation'
import { Trash2, ArrowRight, User, Calendar, Home, Plus } from 'lucide-react'
import toast from 'react-hot-toast'

export default function TestDashboardPage() {
  const router = useRouter()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [patientData, setPatientData] = useState<any>(null)

  const checkSession = () => {
    if (typeof window === 'undefined') return
    
    const patient = localStorage.getItem('medcontrol_patient')
    
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
    } else {
      setIsLoggedIn(false)
      setPatientData(null)
      console.log('❌ No hay paciente logueado')
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

  const goToDashboard = () => {
    router.push('/paciente/dashboard')
  }

  const goToAgendar = () => {
    router.push('/agendar')
  }

  const goToHome = () => {
    router.push('/')
  }

  // Verificar sesión al cargar
  useEffect(() => {
    checkSession()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-cyan-100 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🏥 Test de Dashboard
          </h1>
          <p className="text-gray-600">
            Prueba la funcionalidad del dashboard del paciente
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
                <span className="font-medium">Paciente Logueado:</span>
                <span className={`px-2 py-1 rounded text-sm ${
                  isLoggedIn ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {isLoggedIn ? 'Sí' : 'No'}
                </span>
              </div>
              
              {patientData && (
                <div className="space-y-2">
                  <div className="font-medium">Datos del Paciente:</div>
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
          {/* Navegación Principal */}
          <Card>
            <CardHeader>
              <CardTitle>Navegación Principal</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                onClick={goToDashboard}
                className="w-full"
              >
                <User className="w-4 h-4 mr-2" />
                Ir a Dashboard
              </Button>
              
              <Button
                onClick={goToAgendar}
                className="w-full"
                variant="outline"
              >
                <Calendar className="w-4 h-4 mr-2" />
                Agendar Nueva Cita
              </Button>
              
              <Button
                onClick={goToHome}
                className="w-full"
                variant="outline"
              >
                <Home className="w-4 h-4 mr-2" />
                Página Principal
              </Button>
            </CardContent>
          </Card>

          {/* Funcionalidades del Dashboard */}
          <Card>
            <CardHeader>
              <CardTitle>Funcionalidades del Dashboard</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-sm text-gray-600 space-y-1">
                <div>✅ Ver citas agendadas</div>
                <div>✅ Agendar nueva cita</div>
                <div>✅ Cerrar sesión</div>
                <div>✅ Información del paciente</div>
              </div>
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
                <h3 className="font-semibold text-blue-900 mb-2">🔄 Prueba 1: Dashboard Básico</h3>
                <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                  <li>Haz clic en "Simular Paciente"</li>
                  <li>Haz clic en "Ir a Dashboard"</li>
                  <li>Debería mostrar el dashboard con la información del paciente</li>
                  <li>Debería mostrar las citas agendadas (si las hay)</li>
                </ol>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-semibold text-green-900 mb-2">✅ Prueba 2: Agendar Nueva Cita</h3>
                <ol className="text-sm text-green-800 space-y-1 list-decimal list-inside">
                  <li>Con el paciente logueado, haz clic en "Agendar Nueva Cita"</li>
                  <li>Debería mostrar el formulario de agendamiento</li>
                  <li>Completa el formulario y confirma la cita</li>
                  <li>Debería redirigir de vuelta al dashboard</li>
                  <li>La nueva cita debería aparecer en el dashboard</li>
                </ol>
              </div>

              <div className="bg-purple-50 p-4 rounded-lg">
                <h3 className="font-semibold text-purple-900 mb-2">🔄 Prueba 3: Redirección Automática</h3>
                <ol className="text-sm text-purple-800 space-y-1 list-decimal list-inside">
                  <li>Con el paciente logueado, haz clic en "Página Principal"</li>
                  <li>Debería redirigir automáticamente al dashboard</li>
                  <li>Recarga la página del dashboard</li>
                  <li>Debería mantener la sesión y mostrar las citas</li>
                </ol>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


