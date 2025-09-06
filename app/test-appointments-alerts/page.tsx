'use client'

import { useState, useEffect } from 'react'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import { 
  Calendar, 
  Clock, 
  User, 
  Phone, 
  Mail, 
  AlertCircle
} from 'lucide-react'

// Datos de prueba con diferentes fechas y horas
const testAppointments = [
  {
    id: '1',
    appointment_date: '2024-01-15',
    appointment_time: '10:00',
    status: 'scheduled',
    title: 'Consulta de Cardiología',
    description: 'Revisión del corazón',
    patients: {
      first_name: 'Ana',
      last_name: 'García',
      phone: '300-123-4567',
      email: 'ana@example.com'
    }
  },
  {
    id: '2',
    appointment_date: '2024-01-20',
    appointment_time: '14:30',
    status: 'scheduled',
    title: 'Consulta General',
    description: 'Revisión general',
    patients: {
      first_name: 'Carlos',
      last_name: 'López',
      phone: '300-987-6543',
      email: 'carlos@example.com'
    }
  },
  {
    id: '3',
    appointment_date: '2024-01-05',
    appointment_time: '09:15',
    status: 'scheduled',
    title: 'Consulta de Dermatología',
    description: 'Revisión de la piel',
    patients: {
      first_name: 'María',
      last_name: 'Rodríguez',
      phone: '300-555-1234',
      email: 'maria@example.com'
    }
  }
]

export default function TestAppointmentsAlertsPage() {
  const [appointments, setAppointments] = useState(testAppointments)

  // Función para calcular tiempo restante hasta la cita
  const getTimeUntilAppointment = (appointmentDate: string, appointmentTime: string) => {
    const now = new Date()
    const appointmentDateTime = new Date(`${appointmentDate}T${appointmentTime}`)
    const diffMs = appointmentDateTime.getTime() - now.getTime()
    
    if (diffMs < 0) {
      return { isPast: true, minutes: 0, hours: 0, days: 0 }
    }
    
    const diffMinutes = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMinutes / 60)
    const diffDays = Math.floor(diffHours / 24)
    
    return {
      isPast: false,
      minutes: diffMinutes % 60,
      hours: diffHours % 24,
      days: diffDays
    }
  }

  // Función para obtener el tipo de alerta
  const getAlertType = (appointmentDate: string, appointmentTime: string, status: string) => {
    if (status === 'completed' || status === 'cancelled' || status === 'no_show') {
      return null
    }
    
    const timeInfo = getTimeUntilAppointment(appointmentDate, appointmentTime)
    
    if (timeInfo.isPast) {
      return { type: 'overdue', message: 'Cita vencida' }
    }
    
    if (timeInfo.days === 0 && timeInfo.hours === 0 && timeInfo.minutes <= 10) {
      return { type: 'urgent', message: `Cita en ${timeInfo.minutes} minutos` }
    }
    
    if (timeInfo.days === 0 && timeInfo.hours <= 1) {
      return { type: 'warning', message: `Cita en ${timeInfo.hours}h ${timeInfo.minutes}m` }
    }
    
    if (timeInfo.days <= 1) {
      return { type: 'info', message: `Cita mañana a las ${appointmentTime}` }
    }
    
    return null
  }

  // Ordenar citas por fecha y hora (más próximas primero)
  const sortedAppointments = appointments.sort((a, b) => {
    const dateA = new Date(`${a.appointment_date}T${a.appointment_time}`)
    const dateB = new Date(`${b.appointment_date}T${b.appointment_time}`)
    return dateA.getTime() - dateB.getTime() // Orden ascendente: más próximas primero
  })

  // Actualizar cada minuto
  useEffect(() => {
    const interval = setInterval(() => {
      setAppointments(prev => [...prev])
    }, 60000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🧪 Test de Alertas de Citas
          </h1>
          <p className="text-gray-600">
            Prueba del sistema de ordenamiento y alertas de citas
          </p>
        </div>

        <div className="space-y-4">
          {sortedAppointments.map((appointment) => {
            const alert = getAlertType(appointment.appointment_date, appointment.appointment_time, appointment.status)
            const timeInfo = getTimeUntilAppointment(appointment.appointment_date, appointment.appointment_time)
            
            return (
              <div
                key={appointment.id}
                className={`border rounded-lg p-4 hover:shadow-sm transition-shadow ${
                  alert?.type === 'urgent' ? 'border-red-300 bg-red-50' :
                  alert?.type === 'warning' ? 'border-yellow-300 bg-yellow-50' :
                  alert?.type === 'overdue' ? 'border-red-500 bg-red-100' :
                  'border-gray-200'
                }`}
              >
                {/* Alerta de tiempo */}
                {alert && (
                  <div className={`mb-3 p-2 rounded-md text-sm font-medium ${
                    alert.type === 'urgent' ? 'bg-red-200 text-red-800' :
                    alert.type === 'warning' ? 'bg-yellow-200 text-yellow-800' :
                    alert.type === 'overdue' ? 'bg-red-300 text-red-900' :
                    'bg-blue-200 text-blue-800'
                  }`}>
                    <div className="flex items-center">
                      <AlertCircle className="w-4 h-4 mr-2" />
                      {alert.message}
                    </div>
                  </div>
                )}

                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-medium text-gray-900">
                        {appointment.patients.first_name} {appointment.patients.last_name}
                      </h3>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        Programada
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="w-4 h-4 mr-2" />
                        <span>
                          {format(parseISO(appointment.appointment_date), 'dd MMMM yyyy', { locale: es })}
                        </span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Clock className="w-4 h-4 mr-2" />
                        <span>{appointment.appointment_time}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Phone className="w-4 h-4 mr-2" />
                        <span>{appointment.patients.phone}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Mail className="w-4 h-4 mr-2" />
                        <span>{appointment.patients.email}</span>
                      </div>
                    </div>

                    <div className="mb-3">
                      <p className="text-sm font-medium text-gray-700 mb-1">Motivo de la consulta:</p>
                      <p className="text-sm text-gray-600">{appointment.title}</p>
                    </div>

                    {appointment.description && (
                      <div className="mb-3">
                        <p className="text-sm font-medium text-gray-700 mb-1">Descripción:</p>
                        <p className="text-sm text-gray-600">{appointment.description}</p>
                      </div>
                    )}

                    {/* Información de tiempo restante */}
                    <div className="text-xs text-gray-500">
                      <strong>Tiempo restante:</strong> {
                        timeInfo.isPast ? 'Cita vencida' :
                        `${timeInfo.days}d ${timeInfo.hours}h ${timeInfo.minutes}m`
                      }
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2">📋 Instrucciones de Prueba:</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Las citas están ordenadas por fecha (más próximas primero)</li>
            <li>• Las alertas se actualizan cada minuto</li>
            <li>• <strong>Rojo:</strong> Citas vencidas o en ≤10 minutos</li>
            <li>• <strong>Amarillo:</strong> Citas en ≤1 hora</li>
            <li>• <strong>Azul:</strong> Citas de mañana</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
