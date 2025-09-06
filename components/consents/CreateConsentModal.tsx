'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { X, ClipboardCheck, User, Calendar, PenTool } from 'lucide-react'

const consentSchema = z.object({
  patient_id: z.string().min(1, 'Selecciona un paciente'),
  form_type: z.enum(['general_consent', 'surgical_consent', 'privacy_consent', 'treatment_consent'], {
    required_error: 'Selecciona un tipo de consentimiento',
  }),
  consent_date: z.string().min(1, 'La fecha es requerida'),
  consent_given: z.boolean(),
  witness_name: z.string().optional(),
  additional_notes: z.string().optional(),
})

type ConsentFormData = z.infer<typeof consentSchema>

interface Patient {
  id: string
  first_name: string
  last_name: string
  date_of_birth: string
}

interface CreateConsentModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function CreateConsentModal({ isOpen, onClose }: CreateConsentModalProps) {
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<ConsentFormData>({
    resolver: zodResolver(consentSchema),
    defaultValues: {
      consent_date: new Date().toISOString().split('T')[0],
      consent_given: false,
    }
  })

  const consentGiven = watch('consent_given')

  useEffect(() => {
    if (isOpen) {
      fetchPatients()
    }
  }, [isOpen])

  const fetchPatients = async () => {
    try {
      const { getPatients } = await import('@/lib/local-storage')
      const allPatients = getPatients()
      setPatients(allPatients)
    } catch (error) {
      console.error('Error fetching patients:', error)
      toast.error('Error al cargar pacientes')
    }
  }

  const onSubmit = async (data: ConsentFormData) => {
    setLoading(true)
    try {
      if (!currentDoctor?.id) {
        toast.error('No se pudo identificar al doctor actual')
        return
      }

      const { addConsent } = await import('@/lib/local-storage')
      
      addConsent({
        patient_id: data.patient_id,
        doctor_id: currentDoctor.id,
        form_type: data.form_type,
        consent_date: data.consent_date,
        consent_given: data.consent_given,
        witness_name: data.witness_name || null,
        additional_notes: data.additional_notes || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })

      toast.success('Consentimiento creado exitosamente')
      reset()
      onClose()
      window.location.reload() // Recargar para mostrar el nuevo consentimiento
    } catch (error) {
      console.error('Error creating consent:', error)
      toast.error('Error al crear el consentimiento')
    } finally {
      setLoading(false)
    }
  }

  const getFormTypeDescription = (type: string) => {
    switch (type) {
      case 'general_consent':
        return 'Consentimiento general para atención médica'
      case 'surgical_consent':
        return 'Consentimiento para procedimientos quirúrgicos'
      case 'privacy_consent':
        return 'Consentimiento para el manejo de datos personales'
      case 'treatment_consent':
        return 'Consentimiento para tratamientos específicos'
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
            <ClipboardCheck className="w-5 h-5 mr-2" />
            Nuevo Consentimiento Informado
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
                  Fecha del consentimiento *
                </label>
                <input
                  {...register('consent_date')}
                  type="date"
                  className="input-field"
                />
                {errors.consent_date && (
                  <p className="text-red-500 text-sm mt-1">{errors.consent_date.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Tipo de consentimiento */}
          <div>
            <label className="label">Tipo de consentimiento *</label>
            <select
              {...register('form_type')}
              className="input-field"
            >
              <option value="">Selecciona un tipo</option>
              <option value="general_consent">Consentimiento General</option>
              <option value="surgical_consent">Consentimiento Quirúrgico</option>
              <option value="privacy_consent">Consentimiento de Privacidad</option>
              <option value="treatment_consent">Consentimiento de Tratamiento</option>
            </select>
            {errors.form_type && (
              <p className="text-red-500 text-sm mt-1">{errors.form_type.message}</p>
            )}
            {watch('form_type') && (
              <p className="text-sm text-gray-600 mt-1">
                {getFormTypeDescription(watch('form_type'))}
              </p>
            )}
          </div>

          {/* Estado del consentimiento */}
          <div>
            <label className="label">Estado del consentimiento *</label>
            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  {...register('consent_given')}
                  type="radio"
                  value="true"
                  className="mr-3"
                />
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-green-100 rounded-full flex items-center justify-center mr-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900">Consentimiento otorgado</span>
                </div>
              </label>
              <label className="flex items-center">
                <input
                  {...register('consent_given')}
                  type="radio"
                  value="false"
                  className="mr-3"
                />
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-red-100 rounded-full flex items-center justify-center mr-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900">Consentimiento no otorgado</span>
                </div>
              </label>
            </div>
            {errors.consent_given && (
              <p className="text-red-500 text-sm mt-1">{errors.consent_given.message}</p>
            )}
          </div>

          {/* Testigo */}
          {consentGiven && (
            <div>
              <label className="label">
                <PenTool className="w-4 h-4 inline mr-2" />
                Nombre del testigo
              </label>
              <input
                {...register('witness_name')}
                type="text"
                className="input-field"
                placeholder="Nombre completo del testigo (opcional)"
              />
            </div>
          )}

          {/* Notas adicionales */}
          <div>
            <label className="label">Notas adicionales</label>
            <textarea
              {...register('additional_notes')}
              rows={3}
              className="input-field"
              placeholder="Notas adicionales sobre el consentimiento (opcional)..."
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
              {loading ? 'Creando...' : 'Crear Consentimiento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

