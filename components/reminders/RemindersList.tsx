'use client'

import { useState, useEffect } from 'react'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import { 
  Bell, 
  Calendar, 
  Clock, 
  User, 
  Phone, 
  Mail, 
  CheckCircle, 
  XCircle, 
  MoreVertical, 
  Edit, 
  Trash2,
  Send
} from 'lucide-react'
import { getReminders, getAppointments, getPatients } from '@/lib/local-storage'

interface Patient {
  first_name: string
  last_name: string
  phone?: string
  email?: string
}

interface Appointment {
  appointment_date: string
  appointment_time: string
  reason: string
  patients: Patient
}

interface Reminder {
  id: string
  reminder_type: 'email' | 'sms' | 'call'
  scheduled_time: string
  sent: boolean
  sent_at?: string
  message?: string
  appointments: Appointment
  created_at: string
}

export default function RemindersList() {
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchReminders = () => {
      try {
        if (!currentDoctor?.id) {
          setLoading(false)
          return
        }

        const allReminders = getReminders(currentDoctor.id)
        const allAppointments = getAppointments(currentDoctor.id)
        const allPatients = getPatients(currentDoctor.id)
        
        // Combinar recordatorios con datos de citas y pacientes
        const remindersWithData = allReminders.map(reminder => {
          const appointment = allAppointments.find(a => a.id === reminder.appointment_id)
          const patient = appointment ? allPatients.find(p => p.id === appointment.patient_id) : null
          
          return {
            ...reminder,
            appointments: appointment ? {
              appointment_date: appointment.appointment_date,
              appointment_time: appointment.appointment_time,
              reason: appointment.reason,
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
            } : {
              appointment_date: '1900-01-01',
              appointment_time: '00:00',
              reason: 'Cita no encontrada',
              patients: {
                first_name: 'Paciente',
                last_name: 'No encontrado',
                phone: '',
                email: ''
              }
            }
          }
        })

        setReminders(remindersWithData)
      } catch (error) {
        console.error('Error fetching reminders:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchReminders()
  }, [currentDoctor])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')

  const getReminderTypeIcon = (type: string) => {
    switch (type) {
      case 'email':
        return <Mail className="w-4 h-4" />
      case 'sms':
        return <Phone className="w-4 h-4" />
      case 'call':
        return <Phone className="w-4 h-4" />
      default:
        return <Bell className="w-4 h-4" />
    }
  }

  const getReminderTypeText = (type: string) => {
    switch (type) {
      case 'email':
        return 'Email'
      case 'sms':
        return 'SMS'
      case 'call':
        return 'Llamada'
      default:
        return type
    }
  }

  const getReminderTypeColor = (type: string) => {
    switch (type) {
      case 'email':
        return 'bg-blue-100 text-blue-800'
      case 'sms':
        return 'bg-green-100 text-green-800'
      case 'call':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const filteredReminders = reminders.filter(reminder => {
    const matchesSearch = 
      reminder.appointments.patients.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reminder.appointments.patients.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reminder.message?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesType = selectedType === 'all' || reminder.reminder_type === selectedType
    const matchesStatus = selectedStatus === 'all' || 
      (selectedStatus === 'sent' && reminder.sent) ||
      (selectedStatus === 'pending' && !reminder.sent)
    
    return matchesSearch && matchesType && matchesStatus
  })

  const handleSendReminder = async (reminderId: string) => {
    // Aquí implementarías la funcionalidad de envío
    console.log('Sending reminder:', reminderId)
  }

  return (
    <div className="space-y-6">
      {/* Filtros y búsqueda */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="label">Buscar recordatorio</label>
            <input
              type="text"
              placeholder="Paciente o mensaje..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field"
            />
          </div>
          <div>
            <label className="label">Tipo de recordatorio</label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="input-field"
            >
              <option value="all">Todos los tipos</option>
              <option value="email">Email</option>
              <option value="sms">SMS</option>
              <option value="call">Llamada</option>
            </select>
          </div>
          <div>
            <label className="label">Estado</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="input-field"
            >
              <option value="all">Todos</option>
              <option value="sent">Enviados</option>
              <option value="pending">Pendientes</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lista de recordatorios */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-medium text-gray-900">
            Recordatorios ({filteredReminders.length})
          </h2>
        </div>

        {filteredReminders.length === 0 ? (
          <div className="text-center py-12">
            <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay recordatorios</h3>
            <p className="text-gray-500">
              {searchTerm || selectedType !== 'all' || selectedStatus !== 'all'
                ? 'No se encontraron recordatorios con los filtros aplicados'
                : 'No hay recordatorios programados'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredReminders.map((reminder) => (
              <div
                key={reminder.id}
                className="border border-gray-200 rounded-lg p-6 hover:shadow-sm transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                        {getReminderTypeIcon(reminder.reminder_type)}
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">
                          {reminder.appointments.patients.first_name} {reminder.appointments.patients.last_name}
                        </h3>
                        <div className="flex items-center space-x-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getReminderTypeColor(reminder.reminder_type)}`}>
                            {getReminderTypeText(reminder.reminder_type)}
                          </span>
                          <div className="flex items-center">
                            {reminder.sent ? (
                              <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
                            ) : (
                              <XCircle className="w-4 h-4 text-yellow-500 mr-1" />
                            )}
                            <span className={`text-xs font-medium ${
                              reminder.sent ? 'text-green-600' : 'text-yellow-600'
                            }`}>
                              {reminder.sent ? 'Enviado' : 'Pendiente'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="w-4 h-4 mr-2" />
                        <span>
                          Cita: {format(parseISO(reminder.appointments.appointment_date), 'dd MMM yyyy', { locale: es })}
                        </span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Clock className="w-4 h-4 mr-2" />
                        <span>
                          Programado: {format(parseISO(reminder.scheduled_time), 'dd MMM yyyy HH:mm', { locale: es })}
                        </span>
                      </div>
                    </div>

                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-700 mb-1">Motivo de la cita:</p>
                      <p className="text-sm text-gray-600">{reminder.appointments.reason}</p>
                    </div>

                    {reminder.message && (
                      <div className="mb-4">
                        <p className="text-sm font-medium text-gray-700 mb-1">Mensaje:</p>
                        <p className="text-sm text-gray-600">{reminder.message}</p>
                      </div>
                    )}

                    {reminder.sent && reminder.sent_at && (
                      <div className="mb-4">
                        <p className="text-sm font-medium text-gray-700 mb-1">Enviado el:</p>
                        <p className="text-sm text-gray-600">
                          {format(parseISO(reminder.sent_at), 'dd MMM yyyy HH:mm', { locale: es })}
                        </p>
                      </div>
                    )}

                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      {reminder.appointments.patients.phone && (
                        <div className="flex items-center">
                          <Phone className="w-4 h-4 mr-1" />
                          <span>{reminder.appointments.patients.phone}</span>
                        </div>
                      )}
                      {reminder.appointments.patients.email && (
                        <div className="flex items-center">
                          <Mail className="w-4 h-4 mr-1" />
                          <span>{reminder.appointments.patients.email}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    {!reminder.sent && (
                      <button
                        onClick={() => handleSendReminder(reminder.id)}
                        className="p-2 text-gray-400 hover:text-green-600"
                        title="Enviar ahora"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    )}
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
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

