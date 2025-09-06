'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/providers/AuthProvider'
import { apiClient } from '@/lib/api-client'
import AppointmentActionModal from '@/components/appointments/AppointmentActionModal'

interface Patient {
  first_name: string
  last_name: string
  phone?: string
  email?: string
  date_of_birth?: string
  gender?: string
  address?: string
}

interface Appointment {
  id: string
  appointment_date: string
  appointment_time: string
  duration: number
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show'
  title: string
  description?: string
  patients: Patient
}

export default function TestAppointmentActionsPage() {
  const { user } = useAuth()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
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
            duration: 30,
            patients: patient ? {
              first_name: patient.first_name,
              last_name: patient.last_name,
              phone: patient.phone,
              email: patient.email,
              date_of_birth: patient.date_of_birth,
              gender: patient.gender,
              address: patient.address
            } : {
              first_name: 'Paciente',
              last_name: 'No encontrado',
              phone: '',
              email: '',
              date_of_birth: '',
              gender: '',
              address: ''
            }
          }
        })

        console.log('📅 Citas con datos de pacientes:', appointmentsWithPatients)
        setAppointments(appointmentsWithPatients)
      } catch (error) {
        console.error('Error fetching appointments:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAppointments()
  }, [user])

  const handleUpdateAppointment = async (appointmentId: string, updates: any) => {
    try {
      console.log('Actualizando cita:', appointmentId, updates)
      await apiClient.updateAppointment(appointmentId, updates)
      
      // Actualizar el estado local
      setAppointments(prev => prev.map(apt => 
        apt.id === appointmentId 
          ? { ...apt, ...updates }
          : apt
      ))
      
      console.log('✅ Cita actualizada correctamente')
    } catch (error) {
      console.error('Error updating appointment:', error)
      throw error
    }
  }

  const handleTestAction = (appointment: Appointment) => {
    setSelectedAppointment(appointment)
    setIsModalOpen(true)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Prueba de Acciones de Citas
        </h1>
        <p className="text-gray-600 mt-2">
          Prueba el sistema de gestión de citas con datos reales
        </p>
      </div>

      <div className="bg-white rounded-lg shadow">
        {appointments.length === 0 ? (
          <div className="p-8 text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No hay citas disponibles
            </h3>
            <p className="text-gray-600">
              Crea algunas citas primero para probar el sistema
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {appointments.map((appointment) => (
              <div key={appointment.id} className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-blue-600">
                          {appointment.patients.first_name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {appointment.patients.first_name} {appointment.patients.last_name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {appointment.patients.phone} • {appointment.patients.email}
                        </p>
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <div>
                        <span className="text-sm font-medium text-gray-700">Fecha:</span>
                        <span className="text-sm text-gray-600 ml-2">
                          {new Date(appointment.appointment_date).toLocaleDateString()} {appointment.appointment_time}
                        </span>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-700">Motivo:</span>
                        <span className="text-sm text-gray-600 ml-2">
                          {appointment.title || 'Sin motivo especificado'}
                        </span>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-700">Estado:</span>
                        <span className={`text-sm ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                          appointment.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                          appointment.status === 'scheduled' ? 'bg-yellow-100 text-yellow-800' :
                          appointment.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                          appointment.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {appointment.status}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <button
                      onClick={() => handleTestAction(appointment)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      Gestionar Cita
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de acciones */}
      {selectedAppointment && (
        <AppointmentActionModal
          appointment={selectedAppointment}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false)
            setSelectedAppointment(null)
          }}
          onUpdate={handleUpdateAppointment}
        />
      )}
    </div>
  )
}


