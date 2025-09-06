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
  MoreVertical, 
  Edit, 
  Trash2,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react'
import { getAppointments, getPatients } from '@/lib/local-storage'
import { useAuth } from '@/components/providers/AuthProvider'

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

export default function AppointmentsList() {
  const { user } = useAuth()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        if (!user?.email) {
          setLoading(false)
          return
        }

        console.log('🔄 Cargando citas para doctor:', user.email)
        const { apiClient } = await import('@/lib/api-client')
        
        // Obtener citas del doctor
        const allAppointments = await apiClient.getAppointments(user.email)
        console.log('📅 Citas obtenidas:', allAppointments)
        
        // Obtener TODOS los pacientes (no solo los del doctor)
        const allPatients = await apiClient.getPatients()
        console.log('👥 Todos los pacientes:', allPatients)

        // Combinar citas con datos de pacientes
        const appointmentsWithPatients = allAppointments.map(appointment => {
          console.log('🔍 Buscando paciente para cita:', appointment.id, 'patient_id:', appointment.patient_id)
          const patient = allPatients.find(p => p.id === appointment.patient_id)
          console.log('👤 Paciente encontrado:', patient)
          
          return {
            ...appointment,
            duration: (appointment as any).duration || 30, // Valor por defecto si no existe
            reason: (appointment as any).reason || appointment.title || 'Sin motivo especificado',
            patients: patient ? {
              first_name: patient.first_name,
              last_name: patient.last_name,
              phone: patient.phone,
              email: patient.email,
              date_of_birth: patient.date_of_birth,
              gender: patient.gender,
              address: patient.address,
              document_type: patient.document_type,
              document_number: patient.document_number,
              eps: patient.eps,
              marital_status: patient.marital_status,
              occupation: patient.occupation
            } : {
              first_name: 'Paciente',
              last_name: 'No encontrado',
              phone: '',
              email: '',
              date_of_birth: '',
              gender: '',
              address: '',
              document_type: '',
              document_number: '',
              eps: '',
              marital_status: '',
              occupation: ''
            }
          }
        })

        console.log('📅 Citas obtenidas:', appointmentsWithPatients)
        setAppointments(appointmentsWithPatients)
      } catch (error) {
        console.error('Error fetching appointments:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAppointments()
  }, [user])

  // Actualizar alertas cada minuto
  useEffect(() => {
    const interval = setInterval(() => {
      // Forzar re-render para actualizar alertas de tiempo
      setAppointments(prev => [...prev])
    }, 60000) // Cada minuto

    return () => clearInterval(interval)
  }, [])

  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [selectedDate, setSelectedDate] = useState<string>('')

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'scheduled':
        return <Clock className="w-4 h-4 text-yellow-500" />
      case 'confirmed':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-blue-500" />
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-red-500" />
      case 'no_show':
        return <AlertCircle className="w-4 h-4 text-orange-500" />
      default:
        return <Clock className="w-4 h-4 text-gray-500" />
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

  const filteredAppointments = appointments
    .filter(appointment => {
      const statusMatch = selectedStatus === 'all' || appointment.status === selectedStatus
      const dateMatch = !selectedDate || appointment.appointment_date === selectedDate
      return statusMatch && dateMatch
    })
    .sort((a, b) => {
      const dateA = new Date(`${a.appointment_date}T${a.appointment_time}`)
      const dateB = new Date(`${b.appointment_date}T${b.appointment_time}`)
      const result = dateA.getTime() - dateB.getTime()
      console.log(`🔄 Ordenando: ${a.appointment_date} ${a.appointment_time} vs ${b.appointment_date} ${b.appointment_time} = ${result}`)
      return result // Orden ascendente: más próximas primero
    })

  console.log('📅 Citas filtradas y ordenadas:', filteredAppointments.map(a => `${a.appointment_date} ${a.appointment_time}`))

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="label">Filtrar por estado</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="input-field"
            >
              <option value="all">Todos los estados</option>
              <option value="scheduled">Programada</option>
              <option value="confirmed">Confirmada</option>
              <option value="completed">Completada</option>
              <option value="cancelled">Cancelada</option>
              <option value="no_show">No asistió</option>
            </select>
          </div>
          <div className="flex-1">
            <label className="label">Filtrar por fecha</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="input-field"
            />
          </div>
        </div>
      </div>

      {/* Lista de citas */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-medium text-gray-900">
            Citas ({filteredAppointments.length})
          </h2>
        </div>

        {filteredAppointments.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay citas</h3>
            <p className="text-gray-500">
              {selectedStatus !== 'all' || selectedDate
                ? 'No se encontraron citas con los filtros aplicados'
                : 'No hay citas programadas'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAppointments.map((appointment) => {
              const alert = getAlertType(appointment.appointment_date, appointment.appointment_time, appointment.status)
              
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
                        {getStatusIcon(appointment.status)}
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
                        <span>
                          {format(parseISO(appointment.appointment_date), 'dd MMMM yyyy', { locale: es })}
                        </span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Clock className="w-4 h-4 mr-2" />
                        <span>
                          {appointment.appointment_time} ({appointment.duration} min)
                        </span>
                      </div>
                      {appointment.patients.phone && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Phone className="w-4 h-4 mr-2" />
                          <span>{appointment.patients.phone}</span>
                        </div>
                      )}
                      {appointment.patients.email && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Mail className="w-4 h-4 mr-2" />
                          <span>{appointment.patients.email}</span>
                        </div>
                      )}
                    </div>

                    <div className="mb-3">
                      <p className="text-sm font-medium text-gray-700 mb-1">Motivo de la consulta:</p>
                      <p className="text-sm text-gray-600">{appointment.title || appointment.reason || 'Sin motivo especificado'}</p>
                    </div>

                    {(appointment.notes || appointment.description) && (
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-1">Notas:</p>
                        <p className="text-sm text-gray-600">{appointment.notes || appointment.description}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    <button className="p-2 text-gray-400 hover:text-gray-600">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-red-600">
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-gray-600">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

