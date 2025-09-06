'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { X, User, Phone, Mail, MapPin, Calendar, Shield } from 'lucide-react'
import { useAuth } from '@/components/providers/AuthProvider'

const patientSchema = z.object({
  first_name: z.string().min(1, 'El nombre es requerido'),
  last_name: z.string().min(1, 'El apellido es requerido'),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  phone: z.string().optional(),
  date_of_birth: z.string().min(1, 'La fecha de nacimiento es requerida'),
  gender: z.enum(['male', 'female', 'other'], {
    required_error: 'Selecciona un género',
  }),
  address: z.string().optional(),
  emergency_contact: z.string().optional(),
  emergency_phone: z.string().optional(),
  medical_insurance: z.string().optional(),
  insurance_number: z.string().optional(),
})

type PatientFormData = z.infer<typeof patientSchema>

interface CreatePatientModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function CreatePatientModal({ isOpen, onClose }: CreatePatientModalProps) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<PatientFormData>({
    resolver: zodResolver(patientSchema),
  })

  const onSubmit = async (data: PatientFormData) => {
    setLoading(true)
    try {
      if (!user?.email) {
        toast.error('No se pudo identificar al doctor actual')
        return
      }

      const { apiClient } = await import('@/lib/api-client')
      
      await apiClient.createPatient({
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email || undefined,
        phone: data.phone || undefined,
        date_of_birth: data.date_of_birth,
        gender: data.gender,
        address: data.address || undefined,
        emergency_contact_name: data.emergency_contact || undefined,
        emergency_contact_phone: data.emergency_phone || undefined,
        doctor_id: user.email
      })

      toast.success('Paciente creado exitosamente')
      reset()
      onClose()
      window.location.reload() // Recargar para mostrar el nuevo paciente
    } catch (error) {
      console.error('Error creating patient:', error)
      toast.error('Error al crear el paciente')
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
            <User className="w-5 h-5 mr-2" />
            Nuevo Paciente
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
                  Nombre *
                </label>
                <input
                  {...register('first_name')}
                  type="text"
                  className="input-field"
                  placeholder="Nombre"
                />
                {errors.first_name && (
                  <p className="text-red-500 text-sm mt-1">{errors.first_name.message}</p>
                )}
              </div>

              <div>
                <label className="label">Apellido *</label>
                <input
                  {...register('last_name')}
                  type="text"
                  className="input-field"
                  placeholder="Apellido"
                />
                {errors.last_name && (
                  <p className="text-red-500 text-sm mt-1">{errors.last_name.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="label">
                  <Calendar className="w-4 h-4 inline mr-2" />
                  Fecha de nacimiento *
                </label>
                <input
                  {...register('date_of_birth')}
                  type="date"
                  className="input-field"
                />
                {errors.date_of_birth && (
                  <p className="text-red-500 text-sm mt-1">{errors.date_of_birth.message}</p>
                )}
              </div>

              <div>
                <label className="label">Género *</label>
                <select
                  {...register('gender')}
                  className="input-field"
                >
                  <option value="">Selecciona un género</option>
                  <option value="male">Masculino</option>
                  <option value="female">Femenino</option>
                  <option value="other">Otro</option>
                </select>
                {errors.gender && (
                  <p className="text-red-500 text-sm mt-1">{errors.gender.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Información de contacto */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Información de Contacto</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">
                  <Phone className="w-4 h-4 inline mr-2" />
                  Teléfono
                </label>
                <input
                  {...register('phone')}
                  type="tel"
                  className="input-field"
                  placeholder="Número de teléfono"
                />
              </div>

              <div>
                <label className="label">
                  <Mail className="w-4 h-4 inline mr-2" />
                  Email
                </label>
                <input
                  {...register('email')}
                  type="email"
                  className="input-field"
                  placeholder="correo@ejemplo.com"
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                )}
              </div>
            </div>

            <div className="mt-4">
              <label className="label">
                <MapPin className="w-4 h-4 inline mr-2" />
                Dirección
              </label>
              <textarea
                {...register('address')}
                rows={2}
                className="input-field"
                placeholder="Dirección completa"
              />
            </div>
          </div>

          {/* Contacto de emergencia */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Contacto de Emergencia</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">Nombre del contacto</label>
                <input
                  {...register('emergency_contact')}
                  type="text"
                  className="input-field"
                  placeholder="Nombre completo"
                />
              </div>

              <div>
                <label className="label">Teléfono del contacto</label>
                <input
                  {...register('emergency_phone')}
                  type="tel"
                  className="input-field"
                  placeholder="Número de teléfono"
                />
              </div>
            </div>
          </div>

          {/* Información del seguro */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Información del Seguro</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">
                  <Shield className="w-4 h-4 inline mr-2" />
                  Compañía de seguros
                </label>
                <input
                  {...register('medical_insurance')}
                  type="text"
                  className="input-field"
                  placeholder="Nombre de la compañía"
                />
              </div>

              <div>
                <label className="label">Número de póliza</label>
                <input
                  {...register('insurance_number')}
                  type="text"
                  className="input-field"
                  placeholder="Número de póliza"
                />
              </div>
            </div>
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
              {loading ? 'Creando...' : 'Crear Paciente'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

