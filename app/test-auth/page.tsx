'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { LogOut, LogIn, UserPlus, Calendar } from 'lucide-react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

export default function TestAuthPage() {
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

  useEffect(() => {
    checkAuthStatus()
  }, [])

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
    toast.success('Paciente simulado logueado exitosamente')
  }

  const simulateDoctorLogin = () => {
    const mockDoctor = {
      id: 'test-doctor-123',
      email: 'doctor@example.com',
      full_name: 'Dr. Carlos García',
      role: 'doctor'
    }
    localStorage.setItem('medcontrol_user', JSON.stringify(mockDoctor))
    checkAuthStatus()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🔐 Prueba de Autenticación
          </h1>
          <p className="text-gray-600">
            Prueba el flujo de autenticación para el agendamiento de citas
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Estado Actual */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="w-5 h-5" />
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
                    <p>• {authStatus.doctorData.role}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Acciones */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LogIn className="w-5 h-5" />
                Acciones de Prueba
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Button
                  onClick={simulatePatientLogin}
                  className="w-full"
                  variant="outline"
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Simular Login de Paciente
                </Button>
                
                <Button
                  onClick={simulateDoctorLogin}
                  className="w-full"
                  variant="outline"
                >
                  <LogIn className="w-4 h-4 mr-2" />
                  Simular Login de Doctor
                </Button>
                
                <Button
                  onClick={clearAuth}
                  className="w-full"
                  variant="destructive"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Limpiar Autenticación
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Prueba de Agendamiento */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Prueba de Agendamiento
            </CardTitle>
            <CardDescription>
              Prueba el flujo de agendamiento con diferentes estados de autenticación
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button
                onClick={() => router.push('/agendar')}
                className="w-full"
                disabled={!authStatus.patient && !authStatus.doctor}
              >
                <Calendar className="w-4 h-4 mr-2" />
                Ir a Agendar Cita
              </Button>
              
              <Button
                onClick={() => router.push('/paciente/login')}
                className="w-full"
                variant="outline"
              >
                <LogIn className="w-4 h-4 mr-2" />
                Login de Paciente
              </Button>
              
              <Button
                onClick={() => router.push('/registro')}
                className="w-full"
                variant="outline"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Registro de Paciente
              </Button>
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">📋 Instrucciones de Prueba:</h3>
              <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                <li>Haz clic en "Limpiar Autenticación" para simular un usuario no logueado</li>
                <li>Haz clic en "Ir a Agendar Cita" - debería mostrar el prompt de login</li>
                <li>Haz clic en "Simular Login de Paciente" para autenticarte</li>
                <li>Haz clic en "Ir a Agendar Cita" nuevamente - ahora debería mostrar el formulario</li>
                <li>Prueba el flujo completo de agendamiento</li>
              </ol>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
