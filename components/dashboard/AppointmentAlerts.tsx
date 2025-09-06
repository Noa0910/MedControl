'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/providers/AuthProvider'
import { apiClient } from '@/lib/api-client'
import { format } from 'date-fns'
import { Clock, Calendar, AlertTriangle, AlertCircle } from 'lucide-react'

interface Patient {
  first_name: string
  last_name: string
  phone?: string
  email?: string
}

interface Appointment {
  id: string
  appointment_date: string
  appointment_time: string
  duration: number
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show'
  reason: string
  title: string
  description?: string
  notes?: string
  patients: Patient
  created_at: string
}

export default function AppointmentAlerts() {
  const { user } = useAuth()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        if (!user?.email) {
          setLoading(false)
          return
        }

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

        setAppointments(appointmentsWithPatients)
      } catch (error) {
        console.error('Error fetching appointments:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAppointments()
  }, [user])

  // Actualizar tiempo cada minuto para alertas en tiempo real
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000) // Actualizar cada minuto

    return () => clearInterval(interval)
  }, [])

  // Función para verificar si hay alerta
  const getAlertType = (appointment: Appointment) => {
    // Extraer solo la fecha sin zona horaria
    let appointmentDate = appointment.appointment_date
    if (appointmentDate.includes('T')) {
      appointmentDate = appointmentDate.split('T')[0]
    }
    
    const appointmentDateTime = new Date(`${appointmentDate}T${appointment.appointment_time}`)
    const diffMs = appointmentDateTime.getTime() - currentTime.getTime()
    
    if (isNaN(diffMs)) return null
    
    if (diffMs < 0) return 'overdue'
    if (diffMs <= 15 * 60 * 1000) return 'urgent' // 15 minutos
    if (diffMs <= 60 * 60 * 1000) return 'warning' // 1 hora
    return null
  }

  // Función para obtener el tiempo hasta la cita
  const getTimeUntilAppointment = (appointment: Appointment) => {
    // Extraer solo la fecha sin zona horaria
    let appointmentDate = appointment.appointment_date
    if (appointmentDate.includes('T')) {
      appointmentDate = appointmentDate.split('T')[0]
    }
    
    const appointmentDateTime = new Date(`${appointmentDate}T${appointment.appointment_time}`)
    const diffMs = appointmentDateTime.getTime() - currentTime.getTime()
    
    if (isNaN(diffMs)) return 'Error de fecha'
    
    if (diffMs < 0) {
      const overdueMs = Math.abs(diffMs)
      const overdueMinutes = Math.floor(overdueMs / (1000 * 60))
      const overdueHours = Math.floor(overdueMinutes / 60)
      const overdueDays = Math.floor(overdueHours / 24)
      
      if (overdueDays > 0) return `Hace ${overdueDays} día${overdueDays > 1 ? 's' : ''}`
      if (overdueHours > 0) return `Hace ${overdueHours} hora${overdueHours > 1 ? 's' : ''}`
      return `Hace ${overdueMinutes} min`
    }
    
    const minutes = Math.floor(diffMs / (1000 * 60))
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)
    
    if (days > 0) return `En ${days} día${days > 1 ? 's' : ''}`
    if (hours > 0) return `En ${hours} hora${hours > 1 ? 's' : ''}`
    return `En ${minutes} min`
  }

  // Obtener citas con alertas
  const getAppointmentsWithAlerts = () => {
    return appointments
      .map(appointment => ({
        ...appointment,
        alertType: getAlertType(appointment),
        timeUntil: getTimeUntilAppointment(appointment)
      }))
      .filter(appointment => appointment.alertType !== null)
      .sort((a, b) => {
        const aTime = new Date(`${a.appointment_date}T${a.appointment_time}`).getTime()
        const bTime = new Date(`${b.appointment_date}T${b.appointment_time}`).getTime()
        return aTime - bTime
      })
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg border p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-3 bg-gray-200 rounded"></div>
            <div className="h-3 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    )
  }

  const appointmentsWithAlerts = getAppointmentsWithAlerts()

  if (appointmentsWithAlerts.length === 0) {
    return null // No mostrar el panel si no hay alertas
  }

  return (
    <div className="bg-white rounded-lg shadow-lg border mb-6">
      <div className="p-4 border-b bg-gradient-to-r from-orange-50 to-red-50">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
          <h3 className="text-lg font-semibold text-gray-800">
            🚨 Alertas de Citas ({appointmentsWithAlerts.length})
          </h3>
        </div>
      </div>
      
      <div className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {appointmentsWithAlerts.map(appointment => (
            <div
              key={appointment.id}
              className={`p-4 rounded-lg border-l-4 shadow-sm ${
                appointment.alertType === 'urgent' 
                  ? 'bg-red-50 border-red-500' 
                  : appointment.alertType === 'warning'
                  ? 'bg-yellow-50 border-yellow-500'
                  : 'bg-orange-50 border-orange-500'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-2">
                  {appointment.alertType === 'urgent' && (
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  )}
                  {appointment.alertType === 'warning' && (
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  )}
                  {appointment.alertType === 'overdue' && (
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  )}
                  <span className={`text-sm font-semibold ${
                    appointment.alertType === 'urgent' ? 'text-red-800' :
                    appointment.alertType === 'warning' ? 'text-yellow-800' :
                    'text-orange-800'
                  }`}>
                    {appointment.alertType === 'urgent' ? '🚨 URGENTE' :
                     appointment.alertType === 'warning' ? '⚠️ PRÓXIMA' :
                     '⏰ VENCIDA'}
                  </span>
                </div>
                <span className={`text-xs font-medium ${
                  appointment.alertType === 'urgent' ? 'text-red-600' :
                  appointment.alertType === 'warning' ? 'text-yellow-600' :
                  'text-orange-600'
                }`}>
                  {appointment.timeUntil}
                </span>
              </div>
              
              <div className="space-y-1">
                <h4 className="font-semibold text-gray-900">
                  {appointment.patients.first_name} {appointment.patients.last_name}
                </h4>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4" />
                    <span>{appointment.appointment_time}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                    <span>{format(new Date(appointment.appointment_date), 'dd/MM/yyyy')}</span>
                  </div>
                </div>
                {appointment.title && (
                  <p className="text-sm text-gray-700 truncate">
                    {appointment.title}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}


