'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { useAuth } from '@/components/providers/AuthProvider'
import { apiClient } from '@/lib/api-client'
import { format } from 'date-fns'
import { 
  FileText, 
  User, 
  Calendar, 
  Stethoscope, 
  Search, 
  Filter,
  Clock,
  Activity,
  Heart,
  Brain,
  Eye,
  Bone,
  Shield,
  AlertCircle,
  CheckCircle,
  XCircle
} from 'lucide-react'

interface Patient {
  id: string
  first_name: string
  last_name: string
  phone?: string
  email?: string
  date_of_birth?: string
  gender?: string
  address?: string
  created_at: string
}

interface ClinicalHistory {
  id: string
  patient_id: string
  doctor_id: string
  appointment_id: string | null
  chief_complaint: string
  current_illness: string
  medical_history: string
  surgical_history: string
  allergies: string
  medications: string
  vital_signs: any
  cardiovascular_exam: string
  respiratory_exam: string
  neurological_exam: string
  gastrointestinal_exam: string
  genitourinary_exam: string
  musculoskeletal_exam: string
  dermatological_exam: string
  diagnosis: string
  treatment: string
  recommendations: string
  follow_up: string
  created_at: string
  patient_first_name: string
  patient_last_name: string
  patient_phone: string
  patient_email: string
  doctor_name: string
  doctor_specialty: string
  appointment_date: string
  appointment_time: string
}

interface Appointment {
  id: string
  appointment_date: string
  appointment_time: string
  status: string
  title: string
  description?: string
}

export default function PatientHistoryPage() {
  const params = useParams()
  const { user } = useAuth()
  const patientId = params.id as string
  
  const [patient, setPatient] = useState<Patient | null>(null)
  const [histories, setHistories] = useState<ClinicalHistory[]>([])
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedHistory, setSelectedHistory] = useState<ClinicalHistory | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'histories' | 'appointments'>('all')

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!patientId || !user?.email) {
          setLoading(false)
          return
        }

        // Obtener datos del paciente
        const allPatients = await apiClient.getPatients()
        const patientData = allPatients.find(p => p.id === patientId)
        setPatient(patientData || null)

        // Obtener historias clínicas
        const historiesData = await apiClient.getClinicalHistories(patientId, user.email)
        setHistories(historiesData)

        // Obtener citas del paciente
        const allAppointments = await apiClient.getAppointments(user.email)
        const patientAppointments = allAppointments.filter(apt => apt.patient_id === patientId)
        setAppointments(patientAppointments)

      } catch (error) {
        console.error('Error fetching patient data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [patientId, user])

  const filteredData = () => {
    let data: any[] = []
    
    if (filterType === 'all' || filterType === 'histories') {
      data = [...data, ...histories.map(h => ({ ...h, type: 'history' }))]
    }
    
    if (filterType === 'all' || filterType === 'appointments') {
      data = [...data, ...appointments.map(a => ({ ...a, type: 'appointment' }))]
    }

    if (searchTerm) {
      data = data.filter(item => 
        item.chief_complaint?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.diagnosis?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    return data.sort((a, b) => new Date(b.created_at || b.appointment_date).getTime() - new Date(a.created_at || a.appointment_date).getTime())
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'cancelled': return <XCircle className="w-4 h-4 text-red-600" />
      case 'no_show': return <AlertCircle className="w-4 h-4 text-orange-600" />
      default: return <Clock className="w-4 h-4 text-blue-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      case 'no_show': return 'bg-orange-100 text-orange-800'
      default: return 'bg-blue-100 text-blue-800'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!patient) {
    return (
      <div className="text-center py-12">
        <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Paciente no encontrado</h3>
        <p className="text-gray-600">El paciente solicitado no existe o no tienes acceso a él.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header del paciente */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
            <User className="w-8 h-8 text-blue-600" />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">
              {patient.first_name} {patient.last_name}
            </h1>
            <div className="flex items-center space-x-6 mt-2 text-sm text-gray-600">
              <div className="flex items-center space-x-1">
                <Calendar className="w-4 h-4" />
                <span>Registrado: {format(new Date(patient.created_at), 'dd/MM/yyyy')}</span>
              </div>
              {patient.phone && (
                <div className="flex items-center space-x-1">
                  <span>📞</span>
                  <span>{patient.phone}</span>
                </div>
              )}
              {patient.email && (
                <div className="flex items-center space-x-1">
                  <span>✉️</span>
                  <span>{patient.email}</span>
                </div>
              )}
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">Total de consultas</div>
            <div className="text-2xl font-bold text-blue-600">{histories.length}</div>
          </div>
        </div>
      </div>

      {/* Filtros y búsqueda */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar en historial médico..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setFilterType('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                filterType === 'all' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Todo
            </button>
            <button
              onClick={() => setFilterType('histories')}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                filterType === 'histories' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Historias Clínicas
            </button>
            <button
              onClick={() => setFilterType('appointments')}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                filterType === 'appointments' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Citas
            </button>
          </div>
        </div>
      </div>

      {/* Timeline del historial */}
      <div className="bg-white rounded-lg shadow">
        {filteredData().length === 0 ? (
          <div className="p-8 text-center">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? 'No se encontraron registros' : 'No hay historial médico'}
            </h3>
            <p className="text-gray-600">
              {searchTerm 
                ? 'Intenta con otros términos de búsqueda'
                : 'El historial médico aparecerá aquí cuando se realicen consultas'
              }
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredData().map((item, index) => (
              <div key={`${item.type}-${item.id}`} className="p-6">
                <div className="flex items-start space-x-4">
                  {/* Timeline indicator */}
                  <div className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      item.type === 'history' ? 'bg-green-100' : 'bg-blue-100'
                    }`}>
                      {item.type === 'history' ? (
                        <FileText className="w-4 h-4 text-green-600" />
                      ) : (
                        <Calendar className="w-4 h-4 text-blue-600" />
                      )}
                    </div>
                    {index < filteredData().length - 1 && (
                      <div className="w-0.5 h-8 bg-gray-200 mt-2"></div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {item.type === 'history' ? 'Historia Clínica' : 'Cita Médica'}
                        </h3>
                        {item.type === 'appointment' && (
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                            {item.status}
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-500">
                        {format(new Date(item.created_at || item.appointment_date), 'dd/MM/yyyy HH:mm')}
                      </div>
                    </div>

                    {item.type === 'history' ? (
                      <div className="space-y-3">
                        <div>
                          <span className="text-sm font-medium text-gray-700">Motivo de consulta:</span>
                          <p className="text-sm text-gray-600 mt-1">{item.chief_complaint}</p>
                        </div>
                        
                        {item.diagnosis && (
                          <div>
                            <span className="text-sm font-medium text-gray-700">Diagnóstico:</span>
                            <p className="text-sm text-gray-600 mt-1">{item.diagnosis}</p>
                          </div>
                        )}

                        {item.treatment && (
                          <div>
                            <span className="text-sm font-medium text-gray-700">Tratamiento:</span>
                            <p className="text-sm text-gray-600 mt-1">{item.treatment}</p>
                          </div>
                        )}

                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <div className="flex items-center space-x-1">
                            <Stethoscope className="w-4 h-4" />
                            <span>{item.doctor_name}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <span>{item.doctor_specialty}</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div>
                          <span className="text-sm font-medium text-gray-700">Motivo:</span>
                          <p className="text-sm text-gray-600 mt-1">{item.title || 'Sin motivo especificado'}</p>
                        </div>
                        
                        {item.description && (
                          <div>
                            <span className="text-sm font-medium text-gray-700">Descripción:</span>
                            <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                          </div>
                        )}

                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4" />
                            <span>{format(new Date(item.appointment_date), 'dd/MM/yyyy')} {item.appointment_time}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {item.type === 'history' && (
                      <div className="mt-4">
                        <button
                          onClick={() => setSelectedHistory(item)}
                          className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                        >
                          Ver detalles completos →
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de detalles de historia clínica */}
      {selectedHistory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header del modal */}
            <div className="p-6 border-b bg-gradient-to-r from-green-50 to-blue-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <FileText className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      Historia Clínica Completa
                    </h2>
                    <p className="text-sm text-gray-600">
                      {selectedHistory.patient_first_name} {selectedHistory.patient_last_name}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedHistory(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Contenido del modal */}
            <div className="p-6 space-y-6">
              {/* Información básica */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Información de la Consulta</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm font-medium text-gray-700">Fecha:</span>
                    <p className="text-sm text-gray-600">
                      {format(new Date(selectedHistory.created_at), 'dd/MM/yyyy HH:mm')}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700">Médico:</span>
                    <p className="text-sm text-gray-600">{selectedHistory.doctor_name}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700">Especialidad:</span>
                    <p className="text-sm text-gray-600">{selectedHistory.doctor_specialty}</p>
                  </div>
                  {selectedHistory.appointment_date && (
                    <div>
                      <span className="text-sm font-medium text-gray-700">Cita programada:</span>
                      <p className="text-sm text-gray-600">
                        {format(new Date(selectedHistory.appointment_date), 'dd/MM/yyyy')} {selectedHistory.appointment_time}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Motivo de consulta */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Motivo de Consulta</h3>
                <p className="text-gray-700">{selectedHistory.chief_complaint}</p>
              </div>

              {/* Enfermedad actual */}
              {selectedHistory.current_illness && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Enfermedad Actual</h3>
                  <p className="text-gray-700">{selectedHistory.current_illness}</p>
                </div>
              )}

              {/* Antecedentes */}
              {(selectedHistory.medical_history || selectedHistory.surgical_history || selectedHistory.allergies) && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Antecedentes</h3>
                  <div className="space-y-3">
                    {selectedHistory.medical_history && (
                      <div>
                        <span className="text-sm font-medium text-gray-700">Médicos:</span>
                        <p className="text-sm text-gray-600">{selectedHistory.medical_history}</p>
                      </div>
                    )}
                    {selectedHistory.surgical_history && (
                      <div>
                        <span className="text-sm font-medium text-gray-700">Quirúrgicos:</span>
                        <p className="text-sm text-gray-600">{selectedHistory.surgical_history}</p>
                      </div>
                    )}
                    {selectedHistory.allergies && (
                      <div>
                        <span className="text-sm font-medium text-gray-700">Alergias:</span>
                        <p className="text-sm text-gray-600">{selectedHistory.allergies}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Signos vitales */}
              {selectedHistory.vital_signs && Object.keys(selectedHistory.vital_signs).length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Signos Vitales</h3>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {Object.entries(selectedHistory.vital_signs).map(([key, value]) => (
                      <div key={key} className="bg-gray-50 p-3 rounded">
                        <span className="text-sm font-medium text-gray-700 capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}:
                        </span>
                        <p className="text-sm text-gray-600">{value as string}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Examen por sistemas */}
              {(selectedHistory.cardiovascular_exam || selectedHistory.respiratory_exam || selectedHistory.neurological_exam) && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Examen por Sistemas</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedHistory.cardiovascular_exam && (
                      <div>
                        <span className="text-sm font-medium text-gray-700">Cardiovascular:</span>
                        <p className="text-sm text-gray-600">{selectedHistory.cardiovascular_exam}</p>
                      </div>
                    )}
                    {selectedHistory.respiratory_exam && (
                      <div>
                        <span className="text-sm font-medium text-gray-700">Respiratorio:</span>
                        <p className="text-sm text-gray-600">{selectedHistory.respiratory_exam}</p>
                      </div>
                    )}
                    {selectedHistory.neurological_exam && (
                      <div>
                        <span className="text-sm font-medium text-gray-700">Neurológico:</span>
                        <p className="text-sm text-gray-600">{selectedHistory.neurological_exam}</p>
                      </div>
                    )}
                    {selectedHistory.gastrointestinal_exam && (
                      <div>
                        <span className="text-sm font-medium text-gray-700">Gastrointestinal:</span>
                        <p className="text-sm text-gray-600">{selectedHistory.gastrointestinal_exam}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Diagnóstico */}
              {selectedHistory.diagnosis && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Diagnóstico</h3>
                  <p className="text-gray-700">{selectedHistory.diagnosis}</p>
                </div>
              )}

              {/* Tratamiento */}
              {selectedHistory.treatment && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Tratamiento</h3>
                  <p className="text-gray-700">{selectedHistory.treatment}</p>
                </div>
              )}

              {/* Recomendaciones */}
              {selectedHistory.recommendations && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Recomendaciones</h3>
                  <p className="text-gray-700">{selectedHistory.recommendations}</p>
                </div>
              )}

              {/* Control de seguimiento */}
              {selectedHistory.follow_up && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Control de Seguimiento</h3>
                  <p className="text-gray-700">{selectedHistory.follow_up}</p>
                </div>
              )}
            </div>

            {/* Footer del modal */}
            <div className="p-6 border-t bg-gray-50">
              <div className="flex justify-end">
                <button
                  onClick={() => setSelectedHistory(null)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
