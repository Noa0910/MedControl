'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Calendar, Clock, User, RefreshCw, CheckCircle, XCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { apiClient } from '@/lib/api-client'

export default function TestDoctorAppointmentsPage() {
  const [appointments, setAppointments] = useState<any[]>([])
  const [patients, setPatients] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [doctorEmail, setDoctorEmail] = useState('doc1@gmail.com') // Email del doctor de prueba

  const loadData = async () => {
    setLoading(true)
    try {
      console.log('🔄 Cargando datos para doctor:', doctorEmail)
      
      // Obtener citas del doctor
      const allAppointments = await apiClient.getAppointments(doctorEmail)
      console.log('📅 Citas obtenidas:', allAppointments)
      
      // Obtener TODOS los pacientes
      const allPatients = await apiClient.getPatients()
      console.log('👥 Todos los pacientes:', allPatients)

      // Combinar citas con datos de pacientes
      const appointmentsWithPatients = allAppointments.map(appointment => {
        console.log('🔍 Buscando paciente para cita:', appointment.id, 'patient_id:', appointment.patient_id)
        const patient = allPatients.find(p => p.id === appointment.patient_id)
        console.log('👤 Paciente encontrado:', patient)
        
        return {
          ...appointment,
          patients: patient ? {
            first_name: patient.first_name,
            last_name: patient.last_name,
            phone: patient.phone,
            email: patient.email
          } : {
            first_name: 'Paciente',
            last_name: 'No encontrado',
            phone: '',
            email: ''
          }
        }
      })

      console.log('✅ Citas con pacientes:', appointmentsWithPatients)
      setAppointments(appointmentsWithPatients)
      setPatients(allPatients)
      
      toast.success(`Cargadas ${appointmentsWithPatients.length} citas`)
    } catch (error) {
      console.error('Error loading data:', error)
      toast.error('Error cargando datos')
    } finally {
      setLoading(false)
    }
  }

  const clearData = () => {
    setAppointments([])
    setPatients([])
    toast.success('Datos limpiados')
  }

  useEffect(() => {
    loadData()
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-yellow-100 text-yellow-800'
      case 'confirmed':
        return 'bg-green-100 text-green-800'
      case 'completed':
        return 'bg-blue-100 text-blue-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      case 'no_show':
        return 'bg-orange-100 text-orange-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'Programada'
      case 'confirmed':
        return 'Confirmada'
      case 'completed':
        return 'Completada'
      case 'cancelled':
        return 'Cancelada'
      case 'no_show':
        return 'No asistió'
      default:
        return status
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            👨‍⚕️ Test de Citas del Doctor
          </h1>
          <p className="text-gray-600">
            Verifica que las citas del especialista muestren correctamente los datos del paciente
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Información */}
          <Card>
            <CardHeader>
              <CardTitle>Información</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Doctor:</span>
                  <span className="text-blue-600">{doctorEmail}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">Citas:</span>
                  <span className="text-green-600">{appointments.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">Pacientes:</span>
                  <span className="text-purple-600">{patients.length}</span>
                </div>
              </div>

              <Button
                onClick={loadData}
                disabled={loading}
                className="w-full"
                variant="outline"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                {loading ? 'Cargando...' : 'Recargar Datos'}
              </Button>

              <Button
                onClick={clearData}
                className="w-full"
                variant="destructive"
              >
                Limpiar Lista
              </Button>
            </CardContent>
          </Card>

          {/* Resumen de Problemas */}
          <Card>
            <CardHeader>
              <CardTitle>Resumen de Problemas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {appointments.filter(a => a.patients.first_name === 'Paciente' && a.patients.last_name === 'No encontrado').length > 0 ? (
                  <div className="flex items-center gap-2 text-red-600">
                    <XCircle className="w-4 h-4" />
                    <span className="text-sm">
                      {appointments.filter(a => a.patients.first_name === 'Paciente' && a.patients.last_name === 'No encontrado').length} citas sin datos del paciente
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-sm">Todas las citas tienen datos del paciente</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Debug Info */}
          <Card>
            <CardHeader>
              <CardTitle>Debug Info</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xs space-y-1">
                <div><strong>Última actualización:</strong> {new Date().toLocaleString()}</div>
                <div><strong>Doctor ID:</strong> {appointments[0]?.doctor_id || 'N/A'}</div>
                <div><strong>Total pacientes en BD:</strong> {patients.length}</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lista de Citas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Citas del Doctor ({appointments.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {appointments.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No hay citas registradas para este doctor
              </div>
            ) : (
              <div className="space-y-4">
                {appointments.map((appointment, index) => (
                  <div key={appointment.id || index} className="border rounded-lg p-4 bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <Clock className="w-4 h-4 text-yellow-500" />
                          <h3 className="text-lg font-medium text-gray-900">
                            {appointment.patients.first_name} {appointment.patients.last_name}
                          </h3>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                            {getStatusText(appointment.status)}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                          <div className="flex items-center text-sm text-gray-600">
                            <Calendar className="w-4 h-4 mr-2" />
                            <span>{appointment.appointment_date}</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <Clock className="w-4 h-4 mr-2" />
                            <span>{appointment.appointment_time}</span>
                          </div>
                          {appointment.patients.phone && (
                            <div className="flex items-center text-sm text-gray-600">
                              <User className="w-4 h-4 mr-2" />
                              <span>{appointment.patients.phone}</span>
                            </div>
                          )}
                          {appointment.patients.email && (
                            <div className="flex items-center text-sm text-gray-600">
                              <User className="w-4 h-4 mr-2" />
                              <span>{appointment.patients.email}</span>
                            </div>
                          )}
                        </div>

                        <div className="mb-3">
                          <p className="text-sm font-medium text-gray-700 mb-1">Motivo de la consulta:</p>
                          <p className="text-sm text-gray-600">{appointment.title || appointment.reason || 'Sin motivo especificado'}</p>
                        </div>

                        {appointment.description && (
                          <div className="mb-3">
                            <p className="text-sm font-medium text-gray-700 mb-1">Descripción:</p>
                            <p className="text-sm text-gray-600">{appointment.description}</p>
                          </div>
                        )}

                        {/* Debug Info */}
                        <div className="text-xs text-gray-500 bg-gray-100 p-2 rounded">
                          <div><strong>ID de Cita:</strong> {appointment.id}</div>
                          <div><strong>ID de Paciente:</strong> {appointment.patient_id}</div>
                          <div><strong>ID de Doctor:</strong> {appointment.doctor_id}</div>
                          <div><strong>Paciente Encontrado:</strong> {appointment.patients.first_name !== 'Paciente' ? 'Sí' : 'No'}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
