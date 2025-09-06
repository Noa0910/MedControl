'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/providers/AuthProvider'
import { apiClient } from '@/lib/api-client'

export default function DebugAppointmentsPage() {
  const { user } = useAuth()
  const [appointments, setAppointments] = useState<any[]>([])
  const [patients, setPatients] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!user?.email) {
          setLoading(false)
          return
        }

        console.log('🔄 Cargando datos para doctor:', user.email)
        
        // Obtener citas del doctor
        const allAppointments = await apiClient.getAppointments(user.email)
        console.log('📅 Citas obtenidas:', allAppointments)
        
        // Obtener TODOS los pacientes
        const allPatients = await apiClient.getPatients()
        console.log('👥 Todos los pacientes:', allPatients)

        setAppointments(allAppointments)
        setPatients(allPatients)
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [user])

  if (loading) {
    return <div className="p-8">Cargando...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          🔍 Debug de Citas y Pacientes
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Citas */}
          <div>
            <h2 className="text-xl font-semibold mb-4">📅 Citas ({appointments.length})</h2>
            <div className="space-y-4">
              {appointments.map((appointment, index) => (
                <div key={appointment.id} className="bg-white p-4 rounded-lg border">
                  <div className="font-medium text-sm text-gray-600">Cita #{index + 1}</div>
                  <div className="mt-2 space-y-1">
                    <div><strong>ID:</strong> {appointment.id}</div>
                    <div><strong>Paciente ID:</strong> {appointment.patient_id}</div>
                    <div><strong>Doctor ID:</strong> {appointment.doctor_id}</div>
                    <div><strong>Fecha:</strong> {appointment.appointment_date}</div>
                    <div><strong>Hora:</strong> {appointment.appointment_time}</div>
                    <div><strong>Título:</strong> {appointment.title}</div>
                    <div><strong>Descripción:</strong> {appointment.description}</div>
                    <div><strong>Estado:</strong> {appointment.status}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pacientes */}
          <div>
            <h2 className="text-xl font-semibold mb-4">👥 Pacientes ({patients.length})</h2>
            <div className="space-y-4">
              {patients.map((patient, index) => (
                <div key={patient.id} className="bg-white p-4 rounded-lg border">
                  <div className="font-medium text-sm text-gray-600">Paciente #{index + 1}</div>
                  <div className="mt-2 space-y-1">
                    <div><strong>ID:</strong> {patient.id}</div>
                    <div><strong>Nombre:</strong> {patient.first_name} {patient.last_name}</div>
                    <div><strong>Email:</strong> {patient.email}</div>
                    <div><strong>Teléfono:</strong> {patient.phone}</div>
                    <div><strong>Doctor ID:</strong> {patient.doctor_id}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Información del usuario */}
        <div className="mt-8 bg-white p-4 rounded-lg border">
          <h3 className="text-lg font-semibold mb-2">👤 Usuario Actual</h3>
          <pre className="text-sm text-gray-600 overflow-auto">
            {JSON.stringify(user, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  )
}


