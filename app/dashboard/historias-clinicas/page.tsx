'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { apiClient } from '@/lib/api-client'

interface ClinicalHistory {
  id: string
  patient_id: string
  patient_first_name: string
  patient_last_name: string
  doctor_id: string
  doctor_name: string
  appointment_id: string
  appointment_date: string
  appointment_time: string
  chief_complaint: string
  diagnosis: string
  treatment: string
  notes: string
  created_at: string
  updated_at: string
}

export default function ClinicalHistoriesPage() {
  const { user } = useAuth()
  const [histories, setHistories] = useState<ClinicalHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [patientFilter, setPatientFilter] = useState('')
  const [documentFilter, setDocumentFilter] = useState('')
  const [selectedHistory, setSelectedHistory] = useState<ClinicalHistory | null>(null)
  const [filterType, setFilterType] = useState<'all' | 'patient' | 'document' | 'diagnosis' | 'complaint'>('all')
  const [showSearchForm, setShowSearchForm] = useState(true)

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
    // Filtro por paciente específico (nombre)
    if (patientFilter.trim()) {
      const patientLower = patientFilter.toLowerCase()
      const fullName = `${history.patient_first_name || ''} ${history.patient_last_name || ''}`.toLowerCase()
      if (!fullName.includes(patientLower)) return false
    }
    
    // Filtro por documento del paciente
    if (documentFilter.trim()) {
      const documentLower = documentFilter.toLowerCase()
      // Buscar en el ID del paciente o en cualquier campo que contenga el documento
      const patientId = (history.patient_id || '').toLowerCase()
      if (!patientId.includes(documentLower)) return false
    }
    
    // Filtro general por tipo
    if (!searchTerm.trim()) return true
    
    const searchLower = searchTerm.toLowerCase()
    
    switch (filterType) {
      case 'patient':
        const patientFullName = `${history.patient_first_name || ''} ${history.patient_last_name || ''}`.toLowerCase()
        return patientFullName.includes(searchLower)
      
      case 'document':
        const patientDocId = (history.patient_id || '').toLowerCase()
        return patientDocId.includes(searchLower)
      
      case 'diagnosis':
        return (history.diagnosis || '').toLowerCase().includes(searchLower)
      
      case 'complaint':
        return (history.chief_complaint || '').toLowerCase().includes(searchLower)
      
      case 'all':
      default:
        return (
          (history.patient_first_name || '').toLowerCase().includes(searchLower) ||
          (history.patient_last_name || '').toLowerCase().includes(searchLower) ||
          (history.patient_id || '').toLowerCase().includes(searchLower) ||
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Historias Clínicas</h1>
          <p className="text-gray-600">Gestiona las historias clínicas de los pacientes</p>
        </div>
      </div>

      {/* Formulario de búsqueda */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Búsqueda de Historias</h2>
          <button
            onClick={() => setShowSearchForm(!showSearchForm)}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            {showSearchForm ? 'Ocultar' : 'Mostrar'} Búsqueda
          </button>
        </div>

        {showSearchForm && (
          <div className="space-y-4">
            {/* Búsqueda por nombre del paciente */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Buscar por Nombre del Paciente
              </label>
              <input
                type="text"
                value={patientFilter}
                onChange={(e) => setPatientFilter(e.target.value)}
                placeholder="Ingresa el nombre del paciente..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Búsqueda por documento del paciente */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Buscar por Documento del Paciente
              </label>
              <input
                type="text"
                value={documentFilter}
                onChange={(e) => setDocumentFilter(e.target.value)}
                placeholder="Ingresa el documento del paciente..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Búsqueda general */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Búsqueda General
              </label>
              <div className="flex space-x-4">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar en todas las historias..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value as any)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Buscar en todo</option>
                  <option value="patient">Solo en nombres</option>
                  <option value="document">Solo en documentos</option>
                  <option value="diagnosis">Solo en diagnósticos</option>
                  <option value="complaint">Solo en motivos</option>
                </select>
              </div>
            </div>

            {/* Botones de acción */}
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-600">
                {filteredHistories.length} historias encontradas
              </div>
              <button
                onClick={() => {
                  setSearchTerm('')
                  setPatientFilter('')
                  setDocumentFilter('')
                  setFilterType('all')
                }}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Limpiar todos los filtros
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Lista de historias clínicas */}
      <div className="bg-white rounded-lg shadow">
        {filteredHistories.length === 0 ? (
          <div className="p-8 text-center">
            <div className="text-gray-500 text-lg mb-2">
              {searchTerm || patientFilter || documentFilter 
                ? 'No se encontraron historias que coincidan con los filtros aplicados'
                : 'No hay historias clínicas registradas'
              }
            </div>
            <p className="text-gray-400">
              {searchTerm || patientFilter || documentFilter 
                ? 'Intenta ajustar los filtros de búsqueda'
                : 'Las historias clínicas aparecerán aquí cuando se creen'
              }
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Paciente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Doctor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Motivo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Diagnóstico
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredHistories.map((history) => (
                  <tr key={history.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {history.patient_first_name} {history.patient_last_name}
                      </div>
                      <div className="text-sm text-gray-500">
                        ID: {history.patient_id}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {history.doctor_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(history.appointment_date).toLocaleDateString()} {history.appointment_time}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 max-w-xs truncate">
                        {history.chief_complaint}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 max-w-xs truncate">
                        {history.diagnosis}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => setSelectedHistory(history)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        Ver
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de detalles */}
      {selectedHistory && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Historia Clínica - {selectedHistory.patient_first_name} {selectedHistory.patient_last_name}
                </h3>
                <button
                  onClick={() => setSelectedHistory(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <span className="sr-only">Cerrar</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Paciente</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {selectedHistory.patient_first_name} {selectedHistory.patient_last_name}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">ID del Paciente</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedHistory.patient_id}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Doctor</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedHistory.doctor_name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Fecha y Hora</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {new Date(selectedHistory.appointment_date).toLocaleDateString()} {selectedHistory.appointment_time}
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Motivo de Consulta</label>
                  <p className="mt-1 text-sm text-gray-900 bg-gray-50 p-3 rounded-md">
                    {selectedHistory.chief_complaint}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Diagnóstico</label>
                  <p className="mt-1 text-sm text-gray-900 bg-gray-50 p-3 rounded-md">
                    {selectedHistory.diagnosis}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Tratamiento</label>
                  <p className="mt-1 text-sm text-gray-900 bg-gray-50 p-3 rounded-md">
                    {selectedHistory.treatment}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Notas Adicionales</label>
                  <p className="mt-1 text-sm text-gray-900 bg-gray-50 p-3 rounded-md">
                    {selectedHistory.notes || 'No hay notas adicionales'}
                  </p>
                </div>
              </div>

              <div className="flex justify-end mt-6">
                <button
                  onClick={() => setSelectedHistory(null)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
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