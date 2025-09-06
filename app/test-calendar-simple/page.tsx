'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/providers/AuthProvider'
import { apiClient } from '@/lib/api-client'
import { format } from 'date-fns'

export default function TestCalendarSimplePage() {
  const { user } = useAuth()
  const [appointments, setAppointments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        if (!user?.email) {
          setLoading(false)
          return
        }

        console.log('🔄 Cargando citas para doctor:', user.email)
        const allAppointments = await apiClient.getAppointments(user.email)
        const allPatients = await apiClient.getPatients()

        const appointmentsWithPatients = allAppointments.map(appointment => {
          const patient = allPatients.find(p => p.id === appointment.patient_id)
          
          return {
            ...appointment,
            duration: (appointment as any).duration || 30,
            reason: (appointment as any).reason || appointment.title || 'Sin motivo especificado',
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

        console.log('📅 Citas procesadas:', appointmentsWithPatients)
        setAppointments(appointmentsWithPatients)
      } catch (error) {
        console.error('Error fetching appointments:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAppointments()
  }, [user])

  if (loading) {
    return <div className="p-8">Cargando...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          🧪 Test Simple del Calendario
        </h1>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">
            Todas las citas ({appointments.length})
          </h2>
          
          {appointments.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p>No hay citas disponibles</p>
            </div>
          ) : (
            <div className="space-y-4">
              {appointments.map((appointment, index) => (
                <div key={appointment.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">
                      {appointment.patients.first_name} {appointment.patients.last_name}
                    </h3>
                    <span className="text-sm text-gray-500">#{index + 1}</span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <strong>Fecha:</strong> {appointment.appointment_date}
                    </div>
                    <div>
                      <strong>Hora:</strong> {appointment.appointment_time}
                    </div>
                    <div>
                      <strong>Estado:</strong> {appointment.status}
                    </div>
                    <div>
                      <strong>Título:</strong> {appointment.title}
                    </div>
                    <div>
                      <strong>Duración:</strong> {appointment.duration} min
                    </div>
                    <div>
                      <strong>Email:</strong> {appointment.patients.email}
                    </div>
                  </div>
                  
                  <div className="mt-2 text-xs text-gray-500">
                    <strong>ID:</strong> {appointment.id} | 
                    <strong> Paciente ID:</strong> {appointment.patient_id}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-8 bg-blue-50 p-4 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2">📋 Información de Debug:</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Total de citas cargadas: {appointments.length}</li>
            <li>• Usuario logueado: {user?.email || 'No logueado'}</li>
            <li>• Fechas únicas: {[...new Set(appointments.map(a => a.appointment_date))].length}</li>
            <li>• Estados únicos: {[...new Set(appointments.map(a => a.status))].join(', ')}</li>
          </ul>
        </div>
      </div>
    </div>
  )
}


