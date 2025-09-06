'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { X, Bell, Calendar, Clock, Mail, Phone, MessageSquare } from 'lucide-react'

const reminderSchema = z.object({
  appointment_id: z.string().min(1, 'Selecciona una cita'),
  reminder_type: z.enum(['email', 'sms', 'call'], {
    required_error: 'Selecciona un tipo de recordatorio',
  }),
  scheduled_time: z.string().min(1, 'La fecha y hora son requeridas'),
  message: z.string().optional(),
})

type ReminderFormData = z.infer<typeof reminderSchema>

interface Appointment {
  id: string
  appointment_date: string
  appointment_time: string
  reason: string
  patients: {
    first_name: string
    last_name: string
    phone?: string
    email?: string
  }
}

interface CreateReminderModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function CreateReminderModal({ isOpen, onClose }: CreateReminderModalProps) {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<ReminderFormData>({
    resolver: zodResolver(reminderSchema),
  })

  const selectedAppointmentId = watch('appointment_id')
  const selectedAppointment = appointments.find(apt => apt.id === selectedAppointmentId)

  useEffect(() => {
    if (isOpen) {
      fetchAppointments()
    }
  }, [isOpen])

  const fetchAppointments = async () => {
    try {
      const { getAppointments, getPatients } = await import('@/lib/local-storage')
      const allAppointments = getAppointments()
      const allPatients = getPatients()
      const today = new Date().toISOString().split('T')[0]
      
      const futureAppointments = allAppointments
        .filter(apt => apt.appointment_date >= today && ['scheduled', 'confirmed'].includes(apt.status))
        .map(appointment => {
          const patient = allPatients.find(p => p.id === appointment.patient_id)
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
        .sort((a, b) => a.appointment_date.localeCompare(b.appointment_date))

      setAppointments(futureAppointments)
    } catch (error) {
      console.error('Error fetching appointments:', error)
      toast.error('Error al cargar citas')
    }
  }

  const onSubmit = async (data: ReminderFormData) => {
    setLoading(true)
    try {
      if (!selectedAppointment) {
        toast.error('Cita no encontrada')
        return
      }

      if (!currentDoctor?.id) {
        toast.error('No se pudo identificar al doctor actual')
        return
      }

      const { addReminder } = await import('@/lib/local-storage')
      
      addReminder({
        appointment_id: data.appointment_id,
        patient_id: selectedAppointment.patients.first_name, // Esto debería ser el ID del paciente
        doctor_id: currentDoctor.id,
        reminder_type: data.reminder_type,
        scheduled_time: data.scheduled_time,
        message: data.message || null,
        sent: false,
        created_at: new Date().toISOString()
      })

      toast.success('Recordatorio creado exitosamente')
      reset()
      onClose()
      window.location.reload() // Recargar para mostrar el nuevo recordatorio
    } catch (error) {
      console.error('Error creating reminder:', error)
      toast.error('Error al crear el recordatorio')
    } finally {
      setLoading(false)
    }
  }

  const getReminderTypeIcon = (type: string) => {
    switch (type) {
      case 'email':
        return <Mail className="w-4 h-4" />
      case 'sms':
        return <MessageSquare className="w-4 h-4" />
      case 'call':
        return <Phone className="w-4 h-4" />
      default:
        return <Bell className="w-4 h-4" />
    }
  }

  const getReminderTypeDescription = (type: string) => {
    switch (type) {
      case 'email':
        return 'Se enviará un email al paciente'
      case 'sms':
        return 'Se enviará un SMS al teléfono del paciente'
      case 'call':
        return 'Se realizará una llamada telefónica'
      default:
        return ''
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <Bell className="w-5 h-5 mr-2" />
            Nuevo Recordatorio
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {/* Selección de cita */}
          <div>
            <label className="label">
              <Calendar className="w-4 h-4 inline mr-2" />
              Cita *
            </label>
            <select
              {...register('appointment_id')}
              className="input-field"
            >
              <option value="">Selecciona una cita</option>
              {appointments.map((appointment) => (
                <option key={appointment.id} value={appointment.id}>
                  {appointment.patients.first_name} {appointment.patients.last_name} - 
                  {new Date(appointment.appointment_date).toLocaleDateString('es-ES')} a las {appointment.appointment_time}
                </option>
              ))}
            </select>
            {errors.appointment_id && (
              <p className="text-red-500 text-sm mt-1">{errors.appointment_id.message}</p>
            )}
          </div>

          {/* Información de la cita seleccionada */}
          {selectedAppointment && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="text-sm font-medium text-gray-900 mb-2">Información de la cita:</h3>
              <div className="space-y-1 text-sm text-gray-600">
                <p><strong>Paciente:</strong> {selectedAppointment.patients.first_name} {selectedAppointment.patients.last_name}</p>
                <p><strong>Fecha:</strong> {new Date(selectedAppointment.appointment_date).toLocaleDateString('es-ES')}</p>
                <p><strong>Hora:</strong> {selectedAppointment.appointment_time}</p>
                <p><strong>Motivo:</strong> {selectedAppointment.reason}</p>
                {selectedAppointment.patients.phone && (
                  <p><strong>Teléfono:</strong> {selectedAppointment.patients.phone}</p>
                )}
                {selectedAppointment.patients.email && (
                  <p><strong>Email:</strong> {selectedAppointment.patients.email}</p>
                )}
              </div>
            </div>
          )}

          {/* Tipo de recordatorio */}
          <div>
            <label className="label">Tipo de recordatorio *</label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {['email', 'sms', 'call'].map((type) => (
                <label key={type} className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    {...register('reminder_type')}
                    type="radio"
                    value={type}
                    className="mr-3"
                  />
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                      {getReminderTypeIcon(type)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 capitalize">
                        {type === 'sms' ? 'SMS' : type === 'email' ? 'Email' : 'Llamada'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {getReminderTypeDescription(type)}
                      </p>
                    </div>
                  </div>
                </label>
              ))}
            </div>
            {errors.reminder_type && (
              <p className="text-red-500 text-sm mt-1">{errors.reminder_type.message}</p>
            )}
          </div>

          {/* Fecha y hora programada */}
          <div>
            <label className="label">
              <Clock className="w-4 h-4 inline mr-2" />
              Fecha y hora programada *
            </label>
            <input
              {...register('scheduled_time')}
              type="datetime-local"
              min={new Date().toISOString().slice(0, 16)}
              className="input-field"
            />
            {errors.scheduled_time && (
              <p className="text-red-500 text-sm mt-1">{errors.scheduled_time.message}</p>
            )}
          </div>

          {/* Mensaje personalizado */}
          <div>
            <label className="label">Mensaje personalizado</label>
            <textarea
              {...register('message')}
              rows={3}
              className="input-field"
              placeholder="Mensaje personalizado para el recordatorio (opcional)..."
            />
            <p className="text-xs text-gray-500 mt-1">
              Si no se especifica, se usará un mensaje predeterminado.
            </p>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex items-center"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              ) : null}
              {loading ? 'Creando...' : 'Crear Recordatorio'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

