'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { X, Calendar, Clock, User, FileText } from 'lucide-react'
import { useAuth } from '@/components/providers/AuthProvider'

const appointmentSchema = z.object({
  patient_id: z.string().min(1, 'Selecciona un paciente'),
  appointment_date: z.string().min(1, 'Selecciona una fecha'),
  appointment_time: z.string().min(1, 'Selecciona una hora'),
  duration: z.number().min(15, 'La duración mínima es 15 minutos'),
  reason: z.string().min(1, 'El motivo es requerido'),
  notes: z.string().optional(),
})

type AppointmentFormData = z.infer<typeof appointmentSchema>

interface Patient {
  id: string
  first_name: string
  last_name: string
  phone?: string
}

interface CreateAppointmentModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function CreateAppointmentModal({ isOpen, onClose }: CreateAppointmentModalProps) {
  const { user } = useAuth()
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<AppointmentFormData>({
    resolver: zodResolver(appointmentSchema),
  })

  useEffect(() => {
    if (isOpen) {
      fetchPatients()
    }
  }, [isOpen])

  const fetchPatients = async () => {
    try {
      const { apiClient } = await import('@/lib/api-client')
      const allPatients = await apiClient.getPatients()
      setPatients(allPatients)
    } catch (error) {
      console.error('Error fetching patients:', error)
      toast.error('Error al cargar pacientes')
    }
  }

  const onSubmit = async (data: AppointmentFormData) => {
    setLoading(true)
    try {
      const { apiClient } = await import('@/lib/api-client')
      
      if (!user?.email) {
        toast.error('No se pudo identificar al doctor actual')
        return
      }

      await apiClient.createAppointment({
        patient_id: data.patient_id,
        doctor_id: user.email,
        title: data.reason,
        description: data.notes,
        appointment_date: data.appointment_date,
        appointment_time: data.appointment_time,
        status: 'scheduled'
      })

      toast.success('Cita creada exitosamente')
      reset()
      onClose()
      window.location.reload() // Recargar para mostrar la nueva cita
    } catch (error) {
      console.error('Error creating appointment:', error)
      toast.error('Error al crear la cita')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <Calendar className="w-5 h-5 mr-2" />
            Nueva Cita
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          <div>
            <label className="label">
              <User className="w-4 h-4 inline mr-2" />
              Paciente *
            </label>
            <select
              {...register('patient_id')}
              className="input-field"
            >
              <option value="">Selecciona un paciente</option>
              {patients.map((patient) => (
                <option key={patient.id} value={patient.id}>
                  {patient.first_name} {patient.last_name}
                  {patient.phone && ` - ${patient.phone}`}
                </option>
              ))}
            </select>
            {errors.patient_id && (
              <p className="text-red-500 text-sm mt-1">{errors.patient_id.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">
                <Calendar className="w-4 h-4 inline mr-2" />
                Fecha *
              </label>
              <input
                {...register('appointment_date')}
                type="date"
                min={new Date().toISOString().split('T')[0]}
                className="input-field"
              />
              {errors.appointment_date && (
                <p className="text-red-500 text-sm mt-1">{errors.appointment_date.message}</p>
              )}
            </div>

            <div>
              <label className="label">
                <Clock className="w-4 h-4 inline mr-2" />
                Hora *
              </label>
              <input
                {...register('appointment_time')}
                type="time"
                className="input-field"
              />
              {errors.appointment_time && (
                <p className="text-red-500 text-sm mt-1">{errors.appointment_time.message}</p>
              )}
            </div>
          </div>

          <div>
            <label className="label">Duración (minutos) *</label>
            <select
              {...register('duration', { valueAsNumber: true })}
              className="input-field"
            >
              <option value={15}>15 minutos</option>
              <option value={30}>30 minutos</option>
              <option value={45}>45 minutos</option>
              <option value={60}>1 hora</option>
              <option value={90}>1.5 horas</option>
              <option value={120}>2 horas</option>
            </select>
            {errors.duration && (
              <p className="text-red-500 text-sm mt-1">{errors.duration.message}</p>
            )}
          </div>

          <div>
            <label className="label">
              <FileText className="w-4 h-4 inline mr-2" />
              Motivo de la consulta *
            </label>
            <textarea
              {...register('reason')}
              rows={3}
              className="input-field"
              placeholder="Describe el motivo de la consulta..."
            />
            {errors.reason && (
              <p className="text-red-500 text-sm mt-1">{errors.reason.message}</p>
            )}
          </div>

          <div>
            <label className="label">Notas adicionales</label>
            <textarea
              {...register('notes')}
              rows={2}
              className="input-field"
              placeholder="Notas adicionales (opcional)..."
            />
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
              {loading ? 'Creando...' : 'Crear Cita'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

