'use client'

import { useState, useEffect } from 'react'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import { 
  ClipboardCheck, 
  User, 
  Calendar, 
  CheckCircle, 
  XCircle, 
  MoreVertical, 
  Edit, 
  Trash2,
  Eye,
  Download
} from 'lucide-react'
import Link from 'next/link'
import { getConsents, getPatients } from '@/lib/local-storage'

interface Patient {
  first_name: string
  last_name: string
  date_of_birth: string
}

interface Doctor {
  full_name: string
}

interface Consent {
  id: string
  form_type: 'general_consent' | 'surgical_consent' | 'privacy_consent' | 'treatment_consent'
  consent_given: boolean
  consent_date: string
  witness_name?: string
  patients: Patient
  profiles: Doctor
  created_at: string
}

export default function ConsentsList() {
  const [consents, setConsents] = useState<Consent[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchConsents = () => {
      try {
        if (!currentDoctor?.id) {
          setLoading(false)
          return
        }

        const allConsents = getConsents(currentDoctor.id)
        const allPatients = getPatients(currentDoctor.id)
        
        // Combinar consentimientos con datos de pacientes
        const consentsWithPatients = allConsents.map(consent => {
          const patient = allPatients.find(p => p.id === consent.patient_id)
          return {
            ...consent,
            patients: patient ? {
              first_name: patient.first_name,
              last_name: patient.last_name,
              date_of_birth: patient.date_of_birth
            } : {
              first_name: 'Paciente',
              last_name: 'No encontrado',
              date_of_birth: '1900-01-01'
            },
            profiles: {
              full_name: currentDoctor.full_name
            }
          }
        })

        setConsents(consentsWithPatients)
      } catch (error) {
        console.error('Error fetching consents:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchConsents()
  }, [currentDoctor])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')

  const getFormTypeText = (type: string) => {
    switch (type) {
      case 'general_consent':
        return 'Consentimiento General'
      case 'surgical_consent':
        return 'Consentimiento Quirúrgico'
      case 'privacy_consent':
        return 'Consentimiento de Privacidad'
      case 'treatment_consent':
        return 'Consentimiento de Tratamiento'
      default:
        return type
    }
  }

  const getFormTypeColor = (type: string) => {
    switch (type) {
      case 'general_consent':
        return 'bg-blue-100 text-blue-800'
      case 'surgical_consent':
        return 'bg-red-100 text-red-800'
      case 'privacy_consent':
        return 'bg-green-100 text-green-800'
      case 'treatment_consent':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date()
    const birthDate = parseISO(dateOfBirth)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    
    return age
  }

  const filteredConsents = consents.filter(consent => {
    const matchesSearch = 
      consent.patients.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      consent.patients.last_name.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesType = selectedType === 'all' || consent.form_type === selectedType
    const matchesStatus = selectedStatus === 'all' || 
      (selectedStatus === 'given' && consent.consent_given) ||
      (selectedStatus === 'not_given' && !consent.consent_given)
    
    return matchesSearch && matchesType && matchesStatus
  })

  const handleDownload = (consent: Consent) => {
    // Aquí implementarías la funcionalidad de descarga
    console.log('Downloading consent:', consent.id)
  }

  return (
    <div className="space-y-6">
      {/* Filtros y búsqueda */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="label">Buscar paciente</label>
            <input
              type="text"
              placeholder="Nombre o apellido..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field"
            />
          </div>
          <div>
            <label className="label">Tipo de consentimiento</label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="input-field"
            >
              <option value="all">Todos los tipos</option>
              <option value="general_consent">Consentimiento General</option>
              <option value="surgical_consent">Consentimiento Quirúrgico</option>
              <option value="privacy_consent">Consentimiento de Privacidad</option>
              <option value="treatment_consent">Consentimiento de Tratamiento</option>
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
              <option value="given">Otorgado</option>
              <option value="not_given">No otorgado</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lista de consentimientos */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-medium text-gray-900">
            Consentimientos ({filteredConsents.length})
          </h2>
        </div>

        {filteredConsents.length === 0 ? (
          <div className="text-center py-12">
            <ClipboardCheck className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay consentimientos</h3>
            <p className="text-gray-500">
              {searchTerm || selectedType !== 'all' || selectedStatus !== 'all'
                ? 'No se encontraron consentimientos con los filtros aplicados'
                : 'No hay consentimientos registrados'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredConsents.map((consent) => (
              <div
                key={consent.id}
                className="border border-gray-200 rounded-lg p-6 hover:shadow-sm transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                        <ClipboardCheck className="w-5 h-5 text-primary-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">
                          {consent.patients.first_name} {consent.patients.last_name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {calculateAge(consent.patients.date_of_birth)} años
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4 mb-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getFormTypeColor(consent.form_type)}`}>
                        {getFormTypeText(consent.form_type)}
                      </span>
                      <div className="flex items-center">
                        {consent.consent_given ? (
                          <CheckCircle className="w-5 h-5 text-green-500 mr-1" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-500 mr-1" />
                        )}
                        <span className={`text-sm font-medium ${
                          consent.consent_given ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {consent.consent_given ? 'Otorgado' : 'No otorgado'}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="w-4 h-4 mr-2" />
                        <span>
                          {format(parseISO(consent.consent_date), 'dd MMMM yyyy', { locale: es })}
                        </span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <User className="w-4 h-4 mr-2" />
                        <span>Dr. {consent.profiles.full_name}</span>
                      </div>
                    </div>

                    {consent.witness_name && (
                      <div className="mb-4">
                        <p className="text-sm font-medium text-gray-700 mb-1">Testigo:</p>
                        <p className="text-sm text-gray-600">{consent.witness_name}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => handleDownload(consent)}
                      className="p-2 text-gray-400 hover:text-gray-600"
                      title="Descargar"
                    >
                      <Download className="w-4 h-4" />
                    </button>
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

                <div className="flex space-x-2">
                  <Link
                    href={`/dashboard/consents/${consent.id}`}
                    className="flex-1 btn-secondary flex items-center justify-center text-sm"
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    Ver detalles
                  </Link>
                  <Link
                    href={`/dashboard/patients/${consent.patients}`}
                    className="flex-1 btn-primary flex items-center justify-center text-sm"
                  >
                    <User className="w-4 h-4 mr-1" />
                    Ver paciente
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

