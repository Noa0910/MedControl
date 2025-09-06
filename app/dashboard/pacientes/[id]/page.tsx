'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { useAuth } from '@/components/providers/AuthProvider'
import { apiClient } from '@/lib/api-client'
import { format } from 'date-fns'
import { 
  User, 
  Phone, 
  Mail, 
  Calendar, 
  MapPin,
  Heart,
  FileText,
  Clock,
  Activity,
  ArrowLeft,
  Edit,
  Plus
} from 'lucide-react'
import Link from 'next/link'

interface Patient {
  id: string
  first_name: string
  last_name: string
  phone?: string
  email?: string
  date_of_birth?: string
  gender?: string
  address?: string
  emergency_contact_name?: string
  emergency_contact_phone?: string
  created_at: string
}

interface Appointment {
  id: string
  appointment_date: string
  appointment_time: string
  status: string
  title: string
  description?: string
}

interface ClinicalHistory {
  id: string
  created_at: string
  chief_complaint: string
  diagnosis: string
  doctor_name: string
}

export default function PatientProfilePage() {
  const params = useParams()
  const { user } = useAuth()
  const patientId = params.id as string
  
  const [patient, setPatient] = useState<Patient | null>(null)
  const [recentAppointments, setRecentAppointments] = useState<Appointment[]>([])
  const [recentHistories, setRecentHistories] = useState<ClinicalHistory[]>([])
  const [loading, setLoading] = useState(true)

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

        // Obtener citas recientes del paciente
        const allAppointments = await apiClient.getAppointments(user.email)
        const patientAppointments = allAppointments
          .filter(apt => apt.patient_id === patientId)
          .sort((a, b) => new Date(b.appointment_date).getTime() - new Date(a.appointment_date).getTime())
          .slice(0, 5)
        setRecentAppointments(patientAppointments)

        // Obtener historias clínicas recientes
        const historiesData = await apiClient.getClinicalHistories(patientId, user.email)
        const recentHistoriesData = historiesData
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .slice(0, 3)
        setRecentHistories(recentHistoriesData)

      } catch (error) {
        console.error('Error fetching patient data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [patientId, user])

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date()
    const birthDate = new Date(dateOfBirth)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    
    return age
  }

  const getGenderText = (gender: string) => {
    switch (gender) {
      case 'male': return 'Masculino'
      case 'female': return 'Femenino'
      case 'other': return 'Otro'
      default: return gender
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
      {/* Header con navegación */}
      <div className="flex items-center space-x-4">
        <Link
          href="/dashboard/patients"
          className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {patient.first_name} {patient.last_name}
          </h1>
          <p className="text-gray-600">Perfil del paciente</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Información del paciente */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-10 h-10 text-blue-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">
                {patient.first_name} {patient.last_name}
              </h2>
              <p className="text-gray-600">
                {patient.date_of_birth ? `${calculateAge(patient.date_of_birth)} años` : 'Edad no especificada'} • {getGenderText(patient.gender || '')}
              </p>
            </div>

            <div className="space-y-4">
              {patient.phone && (
                <div className="flex items-center space-x-3">
                  <Phone className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-700">{patient.phone}</span>
                </div>
              )}
              
              {patient.email && (
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-700">{patient.email}</span>
                </div>
              )}
              
              {patient.address && (
                <div className="flex items-center space-x-3">
                  <MapPin className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-700">{patient.address}</span>
                </div>
              )}
              
              <div className="flex items-center space-x-3">
                <Calendar className="w-5 h-5 text-gray-400" />
                <span className="text-gray-700">
                  Registrado: {format(new Date(patient.created_at), 'dd/MM/yyyy')}
                </span>
              </div>
            </div>

            {patient.emergency_contact_name && (
              <div className="mt-6 p-4 bg-red-50 rounded-lg">
                <h3 className="text-sm font-medium text-red-800 mb-2">Contacto de Emergencia</h3>
                <p className="text-sm text-red-700">{patient.emergency_contact_name}</p>
                {patient.emergency_contact_phone && (
                  <p className="text-sm text-red-600">{patient.emergency_contact_phone}</p>
                )}
              </div>
            )}

            <div className="mt-6 space-y-2">
              <Link
                href={`/dashboard/pacientes/${patient.id}/historial`}
                className="w-full btn-primary flex items-center justify-center"
              >
                <FileText className="w-4 h-4 mr-2" />
                Ver Historial Médico Completo
              </Link>
              
              <button className="w-full btn-secondary flex items-center justify-center">
                <Edit className="w-4 h-4 mr-2" />
                Editar Información
              </button>
            </div>
          </div>
        </div>

        {/* Contenido principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Citas recientes */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Citas Recientes</h3>
                <Link
                  href={`/dashboard/pacientes/${patient.id}/historial?filter=appointments`}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Ver todas →
                </Link>
              </div>
            </div>
            
            <div className="p-6">
              {recentAppointments.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600">No hay citas registradas</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentAppointments.map((appointment) => (
                    <div key={appointment.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <Calendar className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{appointment.title || 'Sin motivo'}</h4>
                          <p className="text-sm text-gray-600">
                            {format(new Date(appointment.appointment_date), 'dd/MM/yyyy')} {appointment.appointment_time}
                          </p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                        {appointment.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Historias clínicas recientes */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Historias Clínicas Recientes</h3>
                <Link
                  href={`/dashboard/pacientes/${patient.id}/historial?filter=histories`}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Ver todas →
                </Link>
              </div>
            </div>
            
            <div className="p-6">
              {recentHistories.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600">No hay historias clínicas registradas</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentHistories.map((history) => (
                    <div key={history.id} className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-gray-900">{history.chief_complaint}</h4>
                        <span className="text-sm text-gray-500">
                          {format(new Date(history.created_at), 'dd/MM/yyyy')}
                        </span>
                      </div>
                      {history.diagnosis && (
                        <p className="text-sm text-gray-600 mb-2">
                          <span className="font-medium">Diagnóstico:</span> {history.diagnosis}
                        </p>
                      )}
                      <p className="text-sm text-gray-500">
                        <span className="font-medium">Médico:</span> {history.doctor_name}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Estadísticas rápidas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Activity className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Consultas</p>
                  <p className="text-2xl font-semibold text-gray-900">{recentHistories.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Citas Programadas</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {recentAppointments.filter(apt => apt.status === 'scheduled' || apt.status === 'confirmed').length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Heart className="w-6 h-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Última Consulta</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {recentHistories.length > 0 
                      ? format(new Date(recentHistories[0].created_at), 'dd/MM/yyyy')
                      : 'N/A'
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
