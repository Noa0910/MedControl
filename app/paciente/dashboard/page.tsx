'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { apiClient } from '@/lib/api-client'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Heart, Calendar, Clock, User, Plus, LogOut } from 'lucide-react'
import toast from 'react-hot-toast'

export default function PatientDashboardPage() {
  const router = useRouter()
  const [patient, setPatient] = useState<any>(null)
  const [appointments, setAppointments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Verificar si el paciente está logueado
    const patientData = localStorage.getItem('medcontrol_patient')
    if (!patientData) {
      router.push('/paciente/login')
      return
    }

    const parsedPatient = JSON.parse(patientData)
    setPatient(parsedPatient)
    
    // Cargar citas después de establecer el paciente
    loadAppointments(parsedPatient)
  }, [router])

  const loadAppointments = async (patientData: any) => {
    try {
      console.log('🔄 Cargando citas para paciente:', patientData?.id)
      // Cargar todas las citas y filtrar por el paciente logueado
      const allAppointments = await apiClient.getAppointments()
      console.log('📅 Todas las citas:', allAppointments)
      
      const patientAppointments = allAppointments.filter(appointment => 
        appointment.patient_id === patientData?.id
      )
      console.log('👤 Citas del paciente:', patientAppointments)
      
      setAppointments(patientAppointments)
    } catch (error) {
      console.error('Error loading appointments:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('medcontrol_patient')
    toast.success('Sesión cerrada exitosamente')
    router.push('/')
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatTime = (timeString: string) => {
    return timeString.substring(0, 5) // HH:MM
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-medical-50 to-primary-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando tu perfil...</p>
        </div>
      </div>
    )
  }

  if (!patient) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-medical-50 to-primary-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-primary-600 p-2 rounded-full">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">MedControl</h1>
                <p className="text-sm text-gray-600">Panel de Paciente</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                Hola, {patient.first_name}
              </span>
              <Button
                onClick={handleLogout}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Cerrar Sesión
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Welcome Section */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Bienvenido, {patient.first_name} {patient.last_name}
            </h2>
            <p className="text-gray-600">
              Aquí puedes ver tus citas médicas y gestionar tu salud
            </p>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => router.push('/agendar')}>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="bg-green-100 p-3 rounded-full">
                    <Plus className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Nueva Cita</h3>
                    <p className="text-sm text-gray-600">Agendar una nueva consulta</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="bg-blue-100 p-3 rounded-full">
                    <Calendar className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Mis Citas</h3>
                    <p className="text-sm text-gray-600">{appointments.length} citas programadas</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="bg-purple-100 p-3 rounded-full">
                    <User className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Mi Perfil</h3>
                    <p className="text-sm text-gray-600">Ver y editar información</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Appointments List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Mis Citas Médicas
              </CardTitle>
              <CardDescription>
                Aquí puedes ver todas tus citas programadas
              </CardDescription>
            </CardHeader>
            <CardContent>
              {appointments.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No tienes citas programadas
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Agenda tu primera cita médica
                  </p>
                  <Button
                    onClick={() => router.push('/agendar')}
                    className="btn-primary"
                  >
                    Agendar Cita
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {appointments.map((appointment) => (
                    <div
                      key={appointment.id}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex items-center gap-4">
                        <div className="bg-primary-100 p-2 rounded-full">
                          <Clock className="w-5 h-5 text-primary-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">
                            {appointment.title}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {formatDate(appointment.appointment_date)} a las {formatTime(appointment.appointment_time)}
                          </p>
                          {appointment.description && (
                            <p className="text-sm text-gray-500 mt-1">
                              {appointment.description}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          appointment.status === 'scheduled' 
                            ? 'bg-blue-100 text-blue-800'
                            : appointment.status === 'confirmed'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {appointment.status === 'scheduled' ? 'Programada' : 
                           appointment.status === 'confirmed' ? 'Confirmada' : 
                           appointment.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
