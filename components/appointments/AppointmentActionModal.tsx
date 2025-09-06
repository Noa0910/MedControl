'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { Clock, Calendar, User, FileText, X, CheckCircle, AlertCircle, RotateCcw } from 'lucide-react'
import ClinicalHistoryForm from '../medical/ClinicalHistoryForm'

interface Patient {
  id?: string
  first_name: string
  last_name: string
  phone?: string
  email?: string
  date_of_birth?: string
  gender?: 'male' | 'female' | 'other'
  address?: string
  document_type?: string
  document_number?: string
  eps?: string
  marital_status?: string
  occupation?: string
}

interface Appointment {
  id: string
  doctor_id: string
  patient_id: string
  appointment_date: string
  appointment_time: string
  duration: number
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show'
  title: string
  description?: string
  patients: Patient
}

interface AppointmentActionModalProps {
  appointment: Appointment | null
  isOpen: boolean
  onClose: () => void
  onUpdate: (appointmentId: string, updates: any) => void
}

export default function AppointmentActionModal({ 
  appointment, 
  isOpen, 
  onClose, 
  onUpdate 
}: AppointmentActionModalProps) {
  const [action, setAction] = useState<'attend' | 'reschedule' | 'no_show' | null>(null)
  const [loading, setLoading] = useState(false)
  const [showClinicalHistory, setShowClinicalHistory] = useState(false)
  const [formData, setFormData] = useState({
    newDate: '',
    newTime: '',
    noShowReason: '',
    patientData: {
      first_name: '',
      last_name: '',
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
  })

  if (!isOpen || !appointment) return null

  const handleAction = async (selectedAction: 'attend' | 'reschedule' | 'no_show') => {
    setAction(selectedAction)
    
    if (selectedAction === 'reschedule') {
      // Pre-llenar con fecha y hora actual
      const now = new Date()
      setFormData(prev => ({
        ...prev,
        newDate: format(now, 'yyyy-MM-dd'),
        newTime: format(now, 'HH:mm')
      }))
    } else if (selectedAction === 'attend') {
      // Verificar si el paciente tiene datos completos (documento, fecha nacimiento, género)
      const hasCompleteData = appointment.patients?.document_type && 
                             appointment.patients?.document_number && 
                             appointment.patients?.date_of_birth && 
                             appointment.patients?.gender
      
      console.log('🔍 Verificando paciente:', {
        hasCompleteData,
        patient: appointment.patients,
        document_type: appointment.patients?.document_type,
        document_number: appointment.patients?.document_number,
        date_of_birth: appointment.patients?.date_of_birth,
        gender: appointment.patients?.gender,
        first_name: appointment.patients?.first_name,
        last_name: appointment.patients?.last_name
      })
      
      if (hasCompleteData) {
        // Paciente existente con datos completos - ir directamente a historia clínica
        console.log('✅ Paciente existente con datos completos, yendo a historia clínica')
        
        // Pre-llenar datos del paciente para la historia clínica
        const patientData = {
          first_name: appointment.patients?.first_name || '',
          last_name: appointment.patients?.last_name || '',
          phone: appointment.patients?.phone || '',
          email: appointment.patients?.email || '',
          date_of_birth: appointment.patients?.date_of_birth || '',
          gender: appointment.patients?.gender || '',
          address: appointment.patients?.address || '',
          document_type: appointment.patients?.document_type || '',
          document_number: appointment.patients?.document_number || '',
          eps: appointment.patients?.eps || '',
          marital_status: appointment.patients?.marital_status || '',
          occupation: appointment.patients?.occupation || ''
        }
        
        setFormData(prev => ({
          ...prev,
          patientData
        }))
        
        setShowClinicalHistory(true)
        return
      } else {
        // Paciente registrado pero sin datos completos - mostrar formulario para completar
        console.log('📝 Paciente registrado pero sin datos completos, mostrando formulario para completar')
      const patientData = {
        first_name: appointment.patients?.first_name || '',
        last_name: appointment.patients?.last_name || '',
        phone: appointment.patients?.phone || '',
        email: appointment.patients?.email || '',
        date_of_birth: appointment.patients?.date_of_birth || '',
        gender: appointment.patients?.gender || '',
          address: appointment.patients?.address || '',
          document_type: appointment.patients?.document_type || '',
          document_number: appointment.patients?.document_number || '',
          eps: appointment.patients?.eps || '',
          marital_status: appointment.patients?.marital_status || '',
          occupation: appointment.patients?.occupation || ''
        }
      setFormData(prev => ({
        ...prev,
        patientData
      }))
      }
    }
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      let updates: any = {}

      switch (action) {
        case 'attend':
          // Verificar si es un paciente existente con datos completos
          const hasCompleteData = appointment.patients?.first_name && 
            appointment.patients?.last_name && 
            appointment.patients?.document_type && 
            appointment.patients?.document_number && 
            appointment.patients?.date_of_birth && 
            appointment.patients?.gender

          if (hasCompleteData) {
            // Paciente existente con datos completos - solo actualizar cita y abrir historia clínica
            console.log('✅ Paciente existente con datos completos, actualizando cita y abriendo historia clínica')
            
            updates = {
              status: 'completed',
              patient_id: appointment.patient_id
            }

            await onUpdate(appointment.id, updates)
            
            // Mostrar formulario de historia clínica directamente
            console.log('🎯 Abriendo formulario de historia clínica para paciente existente...')
            setShowClinicalHistory(true)
            setLoading(false)
            console.log('✅ Formulario de historia clínica abierto')
            return
          } else {
            // Paciente registrado pero sin datos completos - actualizar datos existentes
            console.log('📝 Paciente registrado pero sin datos completos, actualizando datos existentes')
            
            const requiredFields = ['first_name', 'last_name', 'document_type', 'document_number', 'date_of_birth', 'gender', 'phone', 'email', 'address']
            const missingFields = requiredFields.filter(field => !formData.patientData[field as keyof typeof formData.patientData])
            
            if (missingFields.length > 0) {
              alert('Por favor complete todos los campos requeridos marcados con *')
              setLoading(false)
              return
            }

            try {
              // Verificar si ya existe un paciente con el mismo documento (para evitar duplicados)
              const { apiClient } = await import('@/lib/api-client')
              const existingPatients = await apiClient.getPatients()
              const existingPatient = existingPatients.find(p => 
                p.document_type === formData.patientData.document_type && 
                p.document_number === formData.patientData.document_number &&
                p.id !== appointment.patient_id // Excluir el paciente actual
              )

              if (existingPatient) {
                // Ya existe otro paciente con el mismo documento
                console.error('❌ Ya existe otro paciente con el mismo documento:', existingPatient)
                alert(`Ya existe otro paciente con el documento ${formData.patientData.document_type} ${formData.patientData.document_number}: ${existingPatient.first_name} ${existingPatient.last_name}`)
                setLoading(false)
                return
              }

              // Actualizar el paciente existente con los datos completos
              console.log('🔄 Actualizando paciente existente con datos completos...')
              const updatedPatient = await apiClient.updatePatient(appointment.patient_id, {
                document_type: formData.patientData.document_type,
                document_number: formData.patientData.document_number,
                date_of_birth: formData.patientData.date_of_birth,
                gender: formData.patientData.gender as 'male' | 'female' | 'other',
                address: formData.patientData.address,
                eps: formData.patientData.eps,
                marital_status: formData.patientData.marital_status,
                occupation: formData.patientData.occupation
              })
              
              console.log('✅ Paciente actualizado:', updatedPatient)

              // Actualizar la cita como completada
          updates = {
            status: 'completed',
                patient_id: appointment.patient_id
              }

              await onUpdate(appointment.id, updates)
              
              // Actualizar formData con el paciente actualizado
              setFormData(prev => ({
                ...prev,
                patientData: {
                  ...prev.patientData,
                  id: appointment.patient_id
                }
              }))
              
          // Mostrar formulario de historia clínica
              console.log('🎯 Abriendo formulario de historia clínica para paciente actualizado...')
          setShowClinicalHistory(true)
              setLoading(false)
              console.log('✅ Formulario de historia clínica abierto')
              return

            } catch (patientError) {
              console.error('Error updating patient:', patientError)
              alert('Error al actualizar los datos del paciente.')
          setLoading(false)
          return
            }
          }
          break
        case 'reschedule':
          updates = {
            appointment_date: formData.newDate,
            appointment_time: formData.newTime,
            status: 'confirmed'
          }
          break
        case 'no_show':
          updates = {
            status: 'no_show',
            no_show_reason: formData.noShowReason
          }
          break
      }

      // Solo cerrar el modal para reschedule y no_show, no para attend
      if (action === 'reschedule' || action === 'no_show') {
      await onUpdate(appointment.id, updates)
      onClose()
      setAction(null)
      }
      setFormData({
        newDate: '',
        newTime: '',
        noShowReason: '',
        patientData: {
          first_name: '',
          last_name: '',
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
      })
    } catch (error) {
      console.error('Error updating appointment:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleClinicalHistorySave = async (historyData: any) => {
    try {
      console.log('🔄 Guardando historia clínica:', historyData)
      console.log('👤 Datos del paciente:', {
        patient_id: (appointment as any).patient_id,
        doctor_id: (appointment as any).doctor_id,
        appointment_id: appointment.id
      })
      
      // Importar apiClient dinámicamente para evitar problemas de SSR
      const { apiClient } = await import('@/lib/api-client')
      
      // Crear la historia clínica
      console.log('📝 Creando historia clínica...')
      const historyResult = await apiClient.createClinicalHistory(
        (appointment as any).patient_id,
        (appointment as any).doctor_id,
        appointment.id,
        historyData
      )
      console.log('✅ Historia clínica creada:', historyResult)
      
      // Actualizar la cita como completada
      console.log('🔄 Actualizando cita como completada...')
      await onUpdate(appointment.id, {
        status: 'completed',
        patientData: formData.patientData
      })
      console.log('✅ Cita actualizada correctamente')
      
      setShowClinicalHistory(false)
      onClose()
      setAction(null)
      setFormData({
        newDate: '',
        newTime: '',
        noShowReason: '',
        patientData: {
          first_name: '',
          last_name: '',
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
      })
      
      console.log('🎉 Proceso completado exitosamente')
    } catch (error) {
      console.error('❌ Error saving clinical history:', error)
      alert('Error al guardar la historia clínica: ' + (error as Error).message)
      throw error
    }
  }

  const handleCancel = () => {
    setAction(null)
    setFormData({
      newDate: '',
      newTime: '',
      noShowReason: '',
      patientData: {
        first_name: '',
        last_name: '',
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
    })
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              Gestionar Cita
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Información de la cita */}
        <div className="p-6 border-b bg-gray-50">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-medium text-gray-900">
                {appointment.patients.first_name} {appointment.patients.last_name}
              </h3>
              <div className="mt-2 space-y-1">
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="w-4 h-4 mr-2" />
                  <span>{format(new Date(appointment.appointment_date), 'dd/MM/yyyy')}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Clock className="w-4 h-4 mr-2" />
                  <span>{appointment.appointment_time}</span>
                </div>
                <div className="text-sm text-gray-600">
                  <strong>Motivo:</strong> {appointment.title}
                </div>
                {appointment.description && (
                  <div className="text-sm text-gray-600">
                    <strong>Descripción:</strong> {appointment.description}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Acciones */}
        <div className="p-6">
          {!action ? (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                ¿Qué acción deseas realizar?
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Atender */}
                <button
                  onClick={() => handleAction('attend')}
                  className="p-4 border-2 border-green-200 rounded-lg hover:border-green-400 hover:bg-green-50 transition-colors text-left"
                >
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                    <div>
                      <h4 className="font-medium text-green-900">Atender</h4>
                      <p className="text-sm text-green-700">Marcar como atendido y crear historia clínica</p>
                    </div>
                  </div>
                </button>

                {/* Reprogramar */}
                <button
                  onClick={() => handleAction('reschedule')}
                  className="p-4 border-2 border-blue-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors text-left"
                >
                  <div className="flex items-center space-x-3">
                    <RotateCcw className="w-8 h-8 text-blue-600" />
                    <div>
                      <h4 className="font-medium text-blue-900">Reprogramar</h4>
                      <p className="text-sm text-blue-700">Cambiar fecha y hora de la cita</p>
                    </div>
                  </div>
                </button>

                {/* No asistió */}
                <button
                  onClick={() => handleAction('no_show')}
                  className="p-4 border-2 border-red-200 rounded-lg hover:border-red-400 hover:bg-red-50 transition-colors text-left"
                >
                  <div className="flex items-center space-x-3">
                    <AlertCircle className="w-8 h-8 text-red-600" />
                    <div>
                      <h4 className="font-medium text-red-900">No Asistió</h4>
                      <p className="text-sm text-red-700">Marcar como no asistió con motivo</p>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Formulario según la acción */}
              {action === 'attend' && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Completar Datos del Paciente
                  </h3>
                  <div className="space-y-4">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <p className="text-sm text-green-800">
                        <strong>Paciente nuevo detectado:</strong> Complete los datos del paciente para crear su perfil y generar la historia clínica.
                      </p>
                    </div>
                    
                    {/* Información Personal */}
                    <div className="space-y-4">
                      <h4 className="text-md font-medium text-gray-800 border-b border-gray-200 pb-2">
                        Información Personal
                      </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Nombre del Paciente *
                        </label>
                        <input
                          type="text"
                          value={formData.patientData.first_name}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            patientData: { ...prev.patientData, first_name: e.target.value }
                          }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Nombre"
                            required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Apellido *
                        </label>
                        <input
                          type="text"
                          value={formData.patientData.last_name}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            patientData: { ...prev.patientData, last_name: e.target.value }
                          }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Apellido"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Tipo de Documento *
                          </label>
                          <select
                            value={formData.patientData.document_type}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              patientData: { ...prev.patientData, document_type: e.target.value }
                            }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                          >
                            <option value="">Seleccionar tipo</option>
                            <option value="CC">Cédula de Ciudadanía</option>
                            <option value="TI">Tarjeta de Identidad</option>
                            <option value="CE">Cédula de Extranjería</option>
                            <option value="PA">Pasaporte</option>
                            <option value="RC">Registro Civil</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Número de Documento *
                          </label>
                          <input
                            type="text"
                            value={formData.patientData.document_number}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              patientData: { ...prev.patientData, document_number: e.target.value }
                            }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Número de documento"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Fecha de Nacimiento *
                          </label>
                          <input
                            type="date"
                            value={formData.patientData.date_of_birth}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              patientData: { ...prev.patientData, date_of_birth: e.target.value }
                            }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Sexo/Género *
                          </label>
                          <select
                            value={formData.patientData.gender}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              patientData: { ...prev.patientData, gender: e.target.value }
                            }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                          >
                            <option value="">Seleccionar género</option>
                            <option value="male">Masculino</option>
                            <option value="female">Femenino</option>
                            <option value="other">Otro</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Información de Contacto */}
                    <div className="space-y-4">
                      <h4 className="text-md font-medium text-gray-800 border-b border-gray-200 pb-2">
                        Información de Contacto
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Teléfono/Celular *
                        </label>
                        <input
                          type="tel"
                          value={formData.patientData.phone}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            patientData: { ...prev.patientData, phone: e.target.value }
                          }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Teléfono"
                            required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Email *
                        </label>
                        <input
                          type="email"
                          value={formData.patientData.email}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            patientData: { ...prev.patientData, email: e.target.value }
                          }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Email"
                            required
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Dirección de Residencia *
                          </label>
                          <input
                            type="text"
                            value={formData.patientData.address}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              patientData: { ...prev.patientData, address: e.target.value }
                            }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Dirección completa"
                            required
                          />
                        </div>
                      </div>
                    </div>

                    {/* Información Adicional */}
                    <div className="space-y-4">
                      <h4 className="text-md font-medium text-gray-800 border-b border-gray-200 pb-2">
                        Información Adicional
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            EPS o Aseguradora
                          </label>
                          <input
                            type="text"
                            value={formData.patientData.eps}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              patientData: { ...prev.patientData, eps: e.target.value }
                            }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="EPS o aseguradora"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Estado Civil
                          </label>
                          <select
                            value={formData.patientData.marital_status}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              patientData: { ...prev.patientData, marital_status: e.target.value }
                            }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="">Seleccionar estado civil</option>
                            <option value="soltero">Soltero(a)</option>
                            <option value="casado">Casado(a)</option>
                            <option value="divorciado">Divorciado(a)</option>
                            <option value="viudo">Viudo(a)</option>
                            <option value="union_libre">Unión Libre</option>
                          </select>
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Ocupación
                          </label>
                          <input
                            type="text"
                            value={formData.patientData.occupation}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              patientData: { ...prev.patientData, occupation: e.target.value }
                            }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Ocupación o profesión"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {action === 'reschedule' && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Reprogramar Cita
                  </h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Nueva Fecha
                        </label>
                        <input
                          type="date"
                          value={formData.newDate}
                          onChange={(e) => setFormData(prev => ({ ...prev, newDate: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Nueva Hora
                        </label>
                        <input
                          type="time"
                          value={formData.newTime}
                          onChange={(e) => setFormData(prev => ({ ...prev, newTime: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {action === 'no_show' && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Marcar como No Asistió
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Motivo de No Asistencia
                      </label>
                      <select
                        value={formData.noShowReason}
                        onChange={(e) => setFormData(prev => ({ ...prev, noShowReason: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Seleccionar motivo</option>
                        <option value="no_contact">No se pudo contactar</option>
                        <option value="cancelled_by_patient">Cancelado por el paciente</option>
                        <option value="forgot">Se olvidó de la cita</option>
                        <option value="emergency">Emergencia personal</option>
                        <option value="transport">Problemas de transporte</option>
                        <option value="other">Otro</option>
                      </select>
                    </div>
                    {formData.noShowReason === 'other' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Especificar motivo
                        </label>
                        <textarea
                          value={formData.noShowReason}
                          onChange={(e) => setFormData(prev => ({ ...prev, noShowReason: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          rows={3}
                          placeholder="Describe el motivo..."
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Botones de acción */}
              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className={`px-4 py-2 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 ${
                    action === 'attend' ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500' :
                    action === 'reschedule' ? 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500' :
                    'bg-red-600 hover:bg-red-700 focus:ring-red-500'
                  } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {loading ? 'Procesando...' : 
                   action === 'attend' ? 'Atender' :
                   action === 'reschedule' ? 'Reprogramar' :
                   'Marcar No Asistió'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Formulario de Historia Clínica */}
      {showClinicalHistory && (
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>Paciente creado:</strong> Proceda a completar la historia clínica del paciente.
            </p>
          </div>
        <ClinicalHistoryForm
          patient={formData.patientData}
          onSave={handleClinicalHistorySave}
          onClose={() => setShowClinicalHistory(false)}
        />
        </div>
      )}
      
      {/* Debug info */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 right-4 bg-black bg-opacity-75 text-white p-2 rounded text-xs">
          showClinicalHistory: {showClinicalHistory ? 'true' : 'false'}
        </div>
      )}
    </div>
  )
}
