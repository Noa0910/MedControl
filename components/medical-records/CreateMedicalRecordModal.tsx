'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { X, FileText, User, Calendar, Stethoscope, Heart, Pill } from 'lucide-react'
import { useAuth } from '@/components/providers/AuthProvider'

const medicalRecordSchema = z.object({
  patient_id: z.string().min(1, 'Selecciona un paciente'),
  record_date: z.string().min(1, 'La fecha es requerida'),
  chief_complaint: z.string().min(1, 'El motivo de consulta es requerido'),
  history_of_present_illness: z.string().min(1, 'La historia de la enfermedad actual es requerida'),
  physical_examination: z.string().min(1, 'El examen físico es requerido'),
  diagnosis: z.string().min(1, 'El diagnóstico es requerido'),
  treatment_plan: z.string().min(1, 'El plan de tratamiento es requerido'),
  prescriptions: z.string().optional(),
  follow_up_notes: z.string().optional(),
  vital_signs: z.string().optional(),
})

type MedicalRecordFormData = z.infer<typeof medicalRecordSchema>

interface Patient {
  id: string
  first_name: string
  last_name: string
  date_of_birth: string
}

interface CreateMedicalRecordModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function CreateMedicalRecordModal({ isOpen, onClose }: CreateMedicalRecordModalProps) {
  const { user } = useAuth()
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<MedicalRecordFormData>({
    resolver: zodResolver(medicalRecordSchema),
    defaultValues: {
      record_date: new Date().toISOString().split('T')[0],
    }
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

  const onSubmit = async (data: MedicalRecordFormData) => {
    setLoading(true)
    try {
      if (!user?.email) {
        toast.error('No se pudo identificar al doctor actual')
        return
      }

      const { apiClient } = await import('@/lib/api-client')
      
      await apiClient.createMedicalRecord({
        patient_id: data.patient_id,
        doctor_id: user.email,
        title: data.chief_complaint,
        diagnosis: data.diagnosis,
        treatment: data.treatment_plan,
        notes: data.history_of_present_illness + '\n\nExamen físico: ' + data.physical_examination + '\n\nPrescripciones: ' + (data.prescriptions || '') + '\n\nNotas de seguimiento: ' + (data.follow_up_notes || '') + '\n\nSignos vitales: ' + (data.vital_signs || ''),
        record_date: data.record_date
      })

      toast.success('Historia clínica creada exitosamente')
      reset()
      onClose()
      window.location.reload() // Recargar para mostrar la nueva historia clínica
    } catch (error) {
      console.error('Error creating medical record:', error)
      toast.error('Error al crear la historia clínica')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <FileText className="w-5 h-5 mr-2" />
            Nueva Historia Clínica
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {/* Información básica */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Información Básica</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    </option>
                  ))}
                </select>
                {errors.patient_id && (
                  <p className="text-red-500 text-sm mt-1">{errors.patient_id.message}</p>
                )}
              </div>

              <div>
                <label className="label">
                  <Calendar className="w-4 h-4 inline mr-2" />
                  Fecha de consulta *
                </label>
                <input
                  {...register('record_date')}
                  type="date"
                  className="input-field"
                />
                {errors.record_date && (
                  <p className="text-red-500 text-sm mt-1">{errors.record_date.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Motivo de consulta */}
          <div>
            <label className="label">
              <Stethoscope className="w-4 h-4 inline mr-2" />
              Motivo de consulta *
            </label>
            <textarea
              {...register('chief_complaint')}
              rows={3}
              className="input-field"
              placeholder="Describe el motivo principal de la consulta..."
            />
            {errors.chief_complaint && (
              <p className="text-red-500 text-sm mt-1">{errors.chief_complaint.message}</p>
            )}
          </div>

          {/* Historia de la enfermedad actual */}
          <div>
            <label className="label">Historia de la enfermedad actual *</label>
            <textarea
              {...register('history_of_present_illness')}
              rows={4}
              className="input-field"
              placeholder="Describe la evolución de la enfermedad, síntomas, duración, factores agravantes o aliviadores..."
            />
            {errors.history_of_present_illness && (
              <p className="text-red-500 text-sm mt-1">{errors.history_of_present_illness.message}</p>
            )}
          </div>

          {/* Examen físico */}
          <div>
            <label className="label">Examen físico *</label>
            <textarea
              {...register('physical_examination')}
              rows={4}
              className="input-field"
              placeholder="Describe los hallazgos del examen físico: signos vitales, inspección, palpación, auscultación, etc..."
            />
            {errors.physical_examination && (
              <p className="text-red-500 text-sm mt-1">{errors.physical_examination.message}</p>
            )}
          </div>

          {/* Signos vitales */}
          <div>
            <label className="label">
              <Heart className="w-4 h-4 inline mr-2" />
              Signos vitales
            </label>
            <textarea
              {...register('vital_signs')}
              rows={2}
              className="input-field"
              placeholder="TA: 120/80, FC: 80, FR: 16, Temp: 36.5°C, SatO2: 98%"
            />
          </div>

          {/* Diagnóstico */}
          <div>
            <label className="label">Diagnóstico *</label>
            <textarea
              {...register('diagnosis')}
              rows={3}
              className="input-field"
              placeholder="Diagnóstico principal y diagnósticos diferenciales..."
            />
            {errors.diagnosis && (
              <p className="text-red-500 text-sm mt-1">{errors.diagnosis.message}</p>
            )}
          </div>

          {/* Plan de tratamiento */}
          <div>
            <label className="label">Plan de tratamiento *</label>
            <textarea
              {...register('treatment_plan')}
              rows={4}
              className="input-field"
              placeholder="Describe el plan de tratamiento: medicamentos, procedimientos, recomendaciones, seguimiento..."
            />
            {errors.treatment_plan && (
              <p className="text-red-500 text-sm mt-1">{errors.treatment_plan.message}</p>
            )}
          </div>

          {/* Prescripciones */}
          <div>
            <label className="label">
              <Pill className="w-4 h-4 inline mr-2" />
              Prescripciones
            </label>
            <textarea
              {...register('prescriptions')}
              rows={3}
              className="input-field"
              placeholder="Medicamentos prescritos con dosis, frecuencia y duración..."
            />
          </div>

          {/* Notas de seguimiento */}
          <div>
            <label className="label">Notas de seguimiento</label>
            <textarea
              {...register('follow_up_notes')}
              rows={2}
              className="input-field"
              placeholder="Recomendaciones de seguimiento, próximas citas, etc..."
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
              {loading ? 'Creando...' : 'Crear Historia Clínica'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

