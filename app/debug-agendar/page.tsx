'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { LogOut, Calendar, User, AlertCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

export default function DebugAgendarPage() {
  const router = useRouter()
  const [authStatus, setAuthStatus] = useState<{
    patient: boolean
    doctor: boolean
    patientData: any
    doctorData: any
  }>({
    patient: false,
    doctor: false,
    patientData: null,
    doctorData: null
  })

  const checkAuthStatus = () => {
    const patientData = localStorage.getItem('medcontrol_patient')
    const doctorData = localStorage.getItem('medcontrol_user')
    
    setAuthStatus({
      patient: !!patientData,
      doctor: !!doctorData,
      patientData: patientData ? JSON.parse(patientData) : null,
      doctorData: doctorData ? JSON.parse(doctorData) : null
    })
  }

  const clearAuth = () => {
    localStorage.removeItem('medcontrol_patient')
    localStorage.removeItem('medcontrol_user')
    checkAuthStatus()
    toast.success('Autenticación limpiada')
  }

  const simulatePatientLogin = () => {
    const mockPatient = {
      id: 'test-patient-123',
      first_name: 'Juan',
      last_name: 'Pérez',
      email: 'juan.perez@example.com'
    }
    localStorage.setItem('medcontrol_patient', JSON.stringify(mockPatient))
    checkAuthStatus()
    toast.success('Paciente simulado logueado')
  }

  const goToAgendar = () => {
    router.push('/agendar')
  }

  // Verificar estado al cargar
  React.useEffect(() => {
    checkAuthStatus()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🐛 Debug - Página de Agendamiento
          </h1>
          <p className="text-gray-600">
            Herramienta para probar el flujo de autenticación en la página de agendamiento
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Estado Actual */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Estado de Autenticación
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Paciente:</span>
                  <span className={`px-2 py-1 rounded text-sm ${
                    authStatus.patient ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {authStatus.patient ? 'Logueado' : 'No logueado'}
                  </span>
                </div>
                {authStatus.patient && authStatus.patientData && (
                  <div className="text-sm text-gray-600 pl-4">
                    <p>• {authStatus.patientData.first_name} {authStatus.patientData.last_name}</p>
                    <p>• {authStatus.patientData.email}</p>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Doctor:</span>
                  <span className={`px-2 py-1 rounded text-sm ${
                    authStatus.doctor ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {authStatus.doctor ? 'Logueado' : 'No logueado'}
                  </span>
                </div>
                {authStatus.doctor && authStatus.doctorData && (
                  <div className="text-sm text-gray-600 pl-4">
                    <p>• {authStatus.doctorData.full_name}</p>
                    <p>• {authStatus.doctorData.email}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Acciones */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                Acciones de Debug
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Button
                  onClick={clearAuth}
                  className="w-full"
                  variant="destructive"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Limpiar Autenticación
                </Button>
                
                <Button
                  onClick={simulatePatientLogin}
                  className="w-full"
                  variant="outline"
                >
                  <User className="w-4 h-4 mr-2" />
                  Simular Login de Paciente
                </Button>
                
                <Button
                  onClick={goToAgendar}
                  className="w-full"
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Ir a Agendar Cita
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Instrucciones */}
        <Card>
          <CardHeader>
            <CardTitle>📋 Instrucciones de Prueba</CardTitle>
            <CardDescription>
              Sigue estos pasos para probar el flujo de autenticación
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-red-50 p-4 rounded-lg">
                <h3 className="font-semibold text-red-900 mb-2">❌ Prueba 1: Sin Autenticación</h3>
                <ol className="text-sm text-red-800 space-y-1 list-decimal list-inside">
                  <li>Haz clic en "Limpiar Autenticación"</li>
                  <li>Haz clic en "Ir a Agendar Cita"</li>
                  <li>Debería mostrar el prompt de login/registro</li>
                </ol>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-semibold text-green-900 mb-2">✅ Prueba 2: Con Autenticación</h3>
                <ol className="text-sm text-green-800 space-y-1 list-decimal list-inside">
                  <li>Haz clic en "Simular Login de Paciente"</li>
                  <li>Haz clic en "Ir a Agendar Cita"</li>
                  <li>Debería mostrar el formulario de agendamiento</li>
                </ol>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-2">🔍 Debug</h3>
                <p className="text-sm text-blue-800">
                  Abre la consola del navegador (F12) para ver los logs de debug que muestran el flujo de autenticación.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
