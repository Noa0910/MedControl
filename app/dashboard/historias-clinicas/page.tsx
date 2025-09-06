'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/providers/AuthProvider'
import { apiClient } from '@/lib/api-client'
import { format } from 'date-fns'
import { FileText, User, Calendar, Stethoscope, Search, Filter } from 'lucide-react'

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

export default function ClinicalHistoriesPage() {
  const { user } = useAuth()
  const [histories, setHistories] = useState<ClinicalHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [patientFilter, setPatientFilter] = useState('')
  const [selectedHistory, setSelectedHistory] = useState<ClinicalHistory | null>(null)
  const [filterType, setFilterType] = useState<'all' | 'patient' | 'diagnosis' | 'complaint'>('all')

  useEffect(() => {
    const fetchHistories = async () => {
      try {
        if (!user?.email) {
          setLoading(false)
          return
        }

        const historiesData = await apiClient.getClinicalHistories(undefined, user.email)
        setHistories(historiesData)
      } catch (error) {
        console.error('Error fetching clinical histories:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchHistories()
  }, [user])

  const filteredHistories = histories.filter(history => {
    // Filtro por paciente específico
    if (patientFilter.trim()) {
      const patientLower = patientFilter.toLowerCase()
      const fullName = `${history.patient_first_name || ''} ${history.patient_last_name || ''}`.toLowerCase()
      if (!fullName.includes(patientLower)) return false
    }
    
    // Filtro general por tipo
    if (!searchTerm.trim()) return true
    
    const searchLower = searchTerm.toLowerCase()
    
    switch (filterType) {
      case 'patient':
        const fullName = `${history.patient_first_name || ''} ${history.patient_last_name || ''}`.toLowerCase()
        return fullName.includes(searchLower)
      
      case 'diagnosis':
        return (history.diagnosis || '').toLowerCase().includes(searchLower)
      
      case 'complaint':
        return (history.chief_complaint || '').toLowerCase().includes(searchLower)
      
      case 'all':
      default:
        return (
          (history.patient_first_name || '').toLowerCase().includes(searchLower) ||
          (history.patient_last_name || '').toLowerCase().includes(searchLower) ||
          (history.chief_complaint || '').toLowerCase().includes(searchLower) ||
          (history.diagnosis || '').toLowerCase().includes(searchLower)
        )
    }
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Historias Clínicas
        </h1>
        <p className="text-gray-600 mt-2">
          Gestiona las historias clínicas de tus pacientes
        </p>
      </div>

      {/* Filtros y búsqueda */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="space-y-4">
          {/* Filtro por paciente específico */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filtrar por Paciente
            </label>
            <div className="flex items-center space-x-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Escribe el nombre del paciente..."
                  value={patientFilter}
                  onChange={(e) => setPatientFilter(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              {patientFilter && (
                <button
                  onClick={() => setPatientFilter('')}
                  className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Limpiar
                </button>
              )}
            </div>
          </div>

          {/* Búsqueda general */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Búsqueda General
            </label>
            <div className="flex items-center space-x-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Buscar en historias clínicas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Buscar en todo</option>
                <option value="patient">Solo en nombres</option>
                <option value="diagnosis">Solo en diagnósticos</option>
                <option value="complaint">Solo en motivos</option>
              </select>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Limpiar
                </button>
              )}
            </div>
          </div>

          {/* Contador de resultados */}
          <div className="flex items-center justify-between pt-2 border-t">
            <div className="text-sm text-gray-600">
              {filteredHistories.length} de {histories.length} historias
              {patientFilter && (
                <span className="ml-2 text-blue-600">
                  • Filtrado por: "{patientFilter}"
                </span>
              )}
            </div>
            {(patientFilter || searchTerm) && (
              <button
                onClick={() => {
                  setPatientFilter('')
                  setSearchTerm('')
                  setFilterType('all')
                }}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                Limpiar todos los filtros
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Lista de historias clínicas */}
      <div className="bg-white rounded-lg shadow">
        {filteredHistories.length === 0 ? (
          <div className="p-8 text-center">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {patientFilter || searchTerm ? 'No se encontraron historias' : 'No hay historias clínicas'}
            </h3>
            <p className="text-gray-600">
              {patientFilter ? (
                <>
                  No se encontraron historias para el paciente "<span className="font-medium text-blue-600">{patientFilter}</span>"
                  <br />
                  <span className="text-sm">Intenta con otro nombre o limpia el filtro</span>
                </>
              ) : searchTerm ? (
                <>
                  No se encontraron historias que coincidan con "<span className="font-medium text-blue-600">{searchTerm}</span>"
                  <br />
                  <span className="text-sm">Intenta con otros términos de búsqueda</span>
                </>
              ) : (
                'Las historias clínicas aparecerán aquí cuando atiendas pacientes'
              )}
            </p>
            {(patientFilter || searchTerm) && (
              <button
                onClick={() => {
                  setPatientFilter('')
                  setSearchTerm('')
                  setFilterType('all')
                }}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Limpiar filtros
              </button>
            )}
          </div>
        ) : (
          <div>
            {/* Indicador de filtro activo */}
            {patientFilter && (
              <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <User className="h-5 w-5 text-blue-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-blue-700">
                      <span className="font-medium">Filtrado por paciente:</span> Mostrando todas las historias clínicas de <span className="font-semibold">{patientFilter}</span>
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            <div className="divide-y divide-gray-200">
              {filteredHistories.map((history) => (
              <div
                key={history.id}
                className="p-6 hover:bg-gray-50 cursor-pointer"
                onClick={() => setSelectedHistory(history)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {history.patient_first_name} {history.patient_last_name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {history.patient_phone} • {history.patient_email}
                        </p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div>
                        <span className="text-sm font-medium text-gray-700">Motivo de consulta:</span>
                        <p className="text-sm text-gray-600 mt-1">
                          {history.chief_complaint}
                        </p>
                      </div>
                      
                      {history.diagnosis && (
                        <div>
                          <span className="text-sm font-medium text-gray-700">Diagnóstico:</span>
                          <p className="text-sm text-gray-600 mt-1">
                            {history.diagnosis}
                          </p>
                        </div>
                      )}
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span>{format(new Date(history.created_at), 'dd/MM/yyyy')}</span>
                        </div>
                        {history.appointment_date && (
                          <div className="flex items-center space-x-1">
                            <Stethoscope className="w-4 h-4" />
                            <span>{format(new Date(history.appointment_date), 'dd/MM/yyyy')} {history.appointment_time}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-sm text-gray-500">
                      {format(new Date(history.created_at), 'HH:mm')}
                    </div>
                    <div className="text-xs text-gray-400">
                      Ver detalles →
                    </div>
                  </div>
                </div>
              </div>
            ))}
            </div>
          </div>
        )}
      </div>

      {/* Modal de detalles */}
      {selectedHistory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header del modal */}
            <div className="p-6 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <FileText className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      Historia Clínica
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
              {/* Información del paciente */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Información del Paciente</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm font-medium text-gray-700">Nombre:</span>
                    <p className="text-sm text-gray-600">{selectedHistory.patient_first_name} {selectedHistory.patient_last_name}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700">Teléfono:</span>
                    <p className="text-sm text-gray-600">{selectedHistory.patient_phone || 'No especificado'}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700">Email:</span>
                    <p className="text-sm text-gray-600">{selectedHistory.patient_email || 'No especificado'}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700">Fecha de consulta:</span>
                    <p className="text-sm text-gray-600">
                      {format(new Date(selectedHistory.created_at), 'dd/MM/yyyy HH:mm')}
                    </p>
                  </div>
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
