'use client'

import { useState, useEffect } from 'react'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import { 
  FileText, 
  User, 
  Calendar, 
  Stethoscope, 
  MoreVertical, 
  Edit, 
  Trash2,
  Eye,
  Download
} from 'lucide-react'
import Link from 'next/link'
import { getMedicalRecords, getPatients } from '@/lib/local-storage'

interface Patient {
  first_name: string
  last_name: string
  date_of_birth: string
}

interface Doctor {
  full_name: string
  specialty?: string
}

interface MedicalRecord {
  id: string
  record_date: string
  chief_complaint: string
  diagnosis: string
  patients: Patient
  profiles: Doctor
  created_at: string
}

interface MedicalRecordsListProps {
  selectedPatientId?: string
}

export default function MedicalRecordsList({ 
  selectedPatientId 
}: MedicalRecordsListProps) {
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchMedicalRecords = () => {
      try {
        if (!currentDoctor?.id) {
          setLoading(false)
          return
        }

        const allRecords = getMedicalRecords(currentDoctor.id)
        const allPatients = getPatients(currentDoctor.id)
        
        // Combinar registros con datos de pacientes
        const recordsWithPatients = allRecords.map(record => {
          const patient = allPatients.find(p => p.id === record.patient_id)
          return {
            ...record,
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
              full_name: currentDoctor.full_name,
              specialty: currentDoctor.specialty
            }
          }
        })

        setMedicalRecords(recordsWithPatients)
      } catch (error) {
        console.error('Error fetching medical records:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchMedicalRecords()
  }, [currentDoctor])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedDate, setSelectedDate] = useState('')

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

  const filteredRecords = medicalRecords.filter(record => {
    const matchesSearch = 
      record.patients.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.patients.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.chief_complaint.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.diagnosis.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesDate = !selectedDate || record.record_date === selectedDate
    const matchesPatient = !selectedPatientId || record.patients === selectedPatientId
    
    return matchesSearch && matchesDate && matchesPatient
  })

  const handleDownload = (record: MedicalRecord) => {
    // Aquí implementarías la funcionalidad de descarga
    console.log('Downloading record:', record.id)
  }

  return (
    <div className="space-y-6">
      {/* Filtros y búsqueda */}
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="label">Buscar en historias clínicas</label>
            <input
              type="text"
              placeholder="Paciente, motivo de consulta, diagnóstico..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field"
            />
          </div>
          <div className="sm:w-48">
            <label className="label">Filtrar por fecha</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="input-field"
            />
          </div>
        </div>
      </div>

      {/* Lista de historias clínicas */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-medium text-gray-900">
            Historias Clínicas ({filteredRecords.length})
          </h2>
        </div>

        {filteredRecords.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay historias clínicas</h3>
            <p className="text-gray-500">
              {searchTerm || selectedDate
                ? 'No se encontraron historias clínicas con los filtros aplicados'
                : 'No hay historias clínicas registradas'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredRecords.map((record) => (
              <div
                key={record.id}
                className="border border-gray-200 rounded-lg p-6 hover:shadow-sm transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                        <FileText className="w-5 h-5 text-primary-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">
                          {record.patients.first_name} {record.patients.last_name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {calculateAge(record.patients.date_of_birth)} años
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="w-4 h-4 mr-2" />
                        <span>
                          {format(parseISO(record.record_date), 'dd MMMM yyyy', { locale: es })}
                        </span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Stethoscope className="w-4 h-4 mr-2" />
                        <span>
                          Dr. {record.profiles.full_name}
                          {record.profiles.specialty && ` - ${record.profiles.specialty}`}
                        </span>
                      </div>
                    </div>

                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-700 mb-1">Motivo de consulta:</p>
                      <p className="text-sm text-gray-600 line-clamp-2">{record.chief_complaint}</p>
                    </div>

                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-700 mb-1">Diagnóstico:</p>
                      <p className="text-sm text-gray-600 line-clamp-2">{record.diagnosis}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => handleDownload(record)}
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
                    href={`/dashboard/medical-records/${record.id}`}
                    className="flex-1 btn-secondary flex items-center justify-center text-sm"
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    Ver detalles
                  </Link>
                  <Link
                    href={`/dashboard/patients/${record.patients}`}
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

