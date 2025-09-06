'use client'

import { useState, useEffect } from 'react'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import { 
  User, 
  Phone, 
  Mail, 
  Calendar, 
  MoreVertical, 
  Edit, 
  Trash2,
  FileText,
  Eye
} from 'lucide-react'
import Link from 'next/link'
import { getPatients } from '@/lib/local-storage'
import { useAuth } from '@/components/providers/AuthProvider'

interface Patient {
  id: string
  first_name: string
  last_name: string
  email?: string
  phone?: string
  date_of_birth: string
  gender: 'male' | 'female' | 'other'
  address?: string
  emergency_contact?: string
  emergency_phone?: string
  medical_insurance?: string
  insurance_number?: string
  created_at: string
}

export default function PatientsList() {
  const { user } = useAuth()
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        if (!user?.email) {
          setLoading(false)
          return
        }

        const { apiClient } = await import('@/lib/api-client')
        const allPatients = await apiClient.getPatients(user.email)
        setPatients(allPatients)
      } catch (error) {
        console.error('Error fetching patients:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchPatients()
  }, [user])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedGender, setSelectedGender] = useState<string>('all')

  const getGenderText = (gender: string) => {
    switch (gender) {
      case 'male':
        return 'Masculino'
      case 'female':
        return 'Femenino'
      case 'other':
        return 'Otro'
      default:
        return gender
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

  const filteredPatients = patients.filter(patient => {
    const matchesSearch = 
      patient.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.phone?.includes(searchTerm)
    
    const matchesGender = selectedGender === 'all' || patient.gender === selectedGender
    
    return matchesSearch && matchesGender
  })

  return (
    <div className="space-y-6">
      {/* Filtros y búsqueda */}
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="label">Buscar paciente</label>
            <input
              type="text"
              placeholder="Nombre, apellido, email o teléfono..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field"
            />
          </div>
          <div className="sm:w-48">
            <label className="label">Filtrar por género</label>
            <select
              value={selectedGender}
              onChange={(e) => setSelectedGender(e.target.value)}
              className="input-field"
            >
              <option value="all">Todos</option>
              <option value="male">Masculino</option>
              <option value="female">Femenino</option>
              <option value="other">Otro</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lista de pacientes */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-medium text-gray-900">
            Pacientes ({filteredPatients.length})
          </h2>
        </div>

        {filteredPatients.length === 0 ? (
          <div className="text-center py-12">
            <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay pacientes</h3>
            <p className="text-gray-500">
              {searchTerm || selectedGender !== 'all'
                ? 'No se encontraron pacientes con los filtros aplicados'
                : 'No hay pacientes registrados'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPatients.map((patient) => (
              <div
                key={patient.id}
                className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-primary-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        {patient.first_name} {patient.last_name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {calculateAge(patient.date_of_birth)} años • {getGenderText(patient.gender)}
                      </p>
                    </div>
                  </div>
                  <button className="p-2 text-gray-400 hover:text-gray-600">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-2 mb-4">
                  {patient.phone && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Phone className="w-4 h-4 mr-2" />
                      <span>{patient.phone}</span>
                    </div>
                  )}
                  {patient.email && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Mail className="w-4 h-4 mr-2" />
                      <span className="truncate">{patient.email}</span>
                    </div>
                  )}
                  {patient.address && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="w-4 h-4 mr-2" />
                      <span className="truncate">{patient.address}</span>
                    </div>
                  )}
                </div>

                {patient.medical_insurance && (
                  <div className="mb-4 p-2 bg-gray-50 rounded">
                    <p className="text-xs text-gray-500">Seguro médico</p>
                    <p className="text-sm font-medium text-gray-900">{patient.medical_insurance}</p>
                    {patient.insurance_number && (
                      <p className="text-xs text-gray-600">N° {patient.insurance_number}</p>
                    )}
                  </div>
                )}

                <div className="flex space-x-2">
                  <Link
                    href={`/dashboard/pacientes/${patient.id}`}
                    className="flex-1 btn-secondary flex items-center justify-center text-sm"
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    Ver perfil
                  </Link>
                  <Link
                    href={`/dashboard/pacientes/${patient.id}/historial`}
                    className="flex-1 btn-primary flex items-center justify-center text-sm"
                  >
                    <FileText className="w-4 h-4 mr-1" />
                    Historial Médico
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

