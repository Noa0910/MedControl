'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { apiClient, Doctor, Appointment } from '@/lib/api-client'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Heart, Calendar, Clock, User, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'

export default function PublicBookingPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const patientId = searchParams.get('patient_id')
  
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [specialties, setSpecialties] = useState<string[]>([])
  const [selectedSpecialty, setSelectedSpecialty] = useState('')
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([])
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null)
  const [loading, setLoading] = useState(false)
  const [loadingDoctors, setLoadingDoctors] = useState(true)
  const [showLoginPrompt, setShowLoginPrompt] = useState(true) // Iniciar como true para requerir autenticación
  const [isInitialized, setIsInitialized] = useState(false) // Para controlar la inicialización
  const [isClient, setIsClient] = useState(false) // Para verificar si estamos en el cliente
  const [appointmentData, setAppointmentData] = useState({
    patient_id: patientId || '',
    doctor_id: '',
    title: '',
    description: '',
    appointment_date: '',
    appointment_time: '',
    status: 'scheduled' as const
  })

  useEffect(() => {
    console.log('🚀 useEffect ejecutándose')
    
    // Marcar que estamos en el cliente
    setIsClient(true)
    
    // Verificar si estamos en el cliente
    if (typeof window === 'undefined') {
      console.log('⚠️ Ejecutándose en servidor, saltando verificación de auth')
      return
    }
    
    console.log('✅ Ejecutándose en cliente, verificando autenticación...')
    
    // Verificar si el usuario está logueado
    const checkAuth = () => {
      const patientData = localStorage.getItem('medcontrol_patient')
      const doctorData = localStorage.getItem('medcontrol_user')
      
      console.log('🔍 Verificando autenticación:', { 
        patientData: !!patientData, 
        doctorData: !!doctorData,
        patientDataContent: patientData,
        doctorDataContent: doctorData
      })
      
      if (!patientData && !doctorData) {
        console.log('❌ No hay usuario logueado, mostrando prompt de login')
        setShowLoginPrompt(true)
        setLoadingDoctors(false) // No cargar doctores si no está logueado
        setIsInitialized(true)
        return
      }
      
      console.log('✅ Usuario logueado, verificando tipo de usuario')
      setIsInitialized(true)
      
      if (patientData) {
        try {
          const patient = JSON.parse(patientData)
          console.log('👤 Paciente logueado detectado, permitiendo agendamiento:', patient)
          setShowLoginPrompt(false)
          setAppointmentData(prev => {
            const newData = {
              ...prev,
              patient_id: patient.id
            }
            console.log('📝 Nuevo appointmentData:', newData)
            return newData
          })
          loadDoctors()
        } catch (error) {
          console.error('Error parsing patient data:', error)
          setShowLoginPrompt(true)
          setLoadingDoctors(false)
          setIsInitialized(true)
          return
        }
      }
      
      if (doctorData) {
        try {
          const doctor = JSON.parse(doctorData)
          console.log('👨‍⚕️ Doctor logueado, cargando doctores:', doctor)
          setShowLoginPrompt(false)
          setAppointmentData(prev => ({
            ...prev,
            patient_id: patientId || '' // Usar patientId de URL para doctores
          }))
          loadDoctors()
        } catch (error) {
          console.error('Error parsing doctor data:', error)
          setShowLoginPrompt(true)
          setLoadingDoctors(false)
          setIsInitialized(true)
          return
        }
      }
    }

    // Ejecutar inmediatamente
    checkAuth()
    
    // También escuchar cambios en localStorage
    const handleStorageChange = (e: StorageEvent) => {
      console.log('📦 Cambio en localStorage detectado:', e.key)
      if (e.key === 'medcontrol_patient' || e.key === 'medcontrol_user') {
        checkAuth()
      }
    }
    
    // Escuchar cuando la página vuelve a estar visible (usuario regresa de login/registro)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('👁️ Página visible, verificando autenticación')
        checkAuth()
      }
    }
    
    window.addEventListener('storage', handleStorageChange)
    document.addEventListener('visibilitychange', handleVisibilityChange)
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  const loadDoctors = async () => {
    try {
      // Usar versión minimal para carga más rápida
      const allDoctors = await apiClient.getDoctorsMinimal()
      
      // Convertir a formato Doctor para compatibilidad
      const doctorList = allDoctors.map(doctor => ({
        ...doctor,
        email: '', // No necesario para la selección
        created_at: '',
        updated_at: ''
      })) as Doctor[]
      
      setDoctors(doctorList)
      
      // Extraer especialidades únicas
      const uniqueSpecialties = [...new Set(doctorList.map(doctor => doctor.specialty).filter(Boolean))]
      setSpecialties(uniqueSpecialties)
    } catch (error) {
      console.error('Error loading doctors:', error)
      toast.error('Error al cargar la lista de doctores. Intenta recargar la página.')
    } finally {
      setLoadingDoctors(false)
    }
  }

  const handleSpecialtyChange = (specialty: string) => {
    setSelectedSpecialty(specialty)
    setSelectedDoctor(null)
    
    if (specialty) {
      const filtered = doctors.filter(doctor => doctor.specialty === specialty)
      setFilteredDoctors(filtered)
    } else {
      setFilteredDoctors([])
    }
  }

  const handleDoctorSelect = (doctor: Doctor) => {
    setSelectedDoctor(doctor)
    setAppointmentData(prev => ({
      ...prev,
      doctor_id: doctor.id,
      title: '' // Campo vacío para que el paciente lo llene manualmente
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    console.log('🔍 Verificando datos antes de enviar:', {
      patientId: patientId,
      appointmentDataPatientId: appointmentData.patient_id,
      appointmentData: appointmentData
    })
    
    if (!appointmentData.patient_id) {
      toast.error('ID de paciente no encontrado. Por favor regístrate primero.')
      return
    }

    setLoading(true)

    try {
      const newAppointment = await apiClient.createAppointment({
        patient_id: appointmentData.patient_id,
        doctor_id: appointmentData.doctor_id,
        title: appointmentData.title,
        description: appointmentData.description,
        appointment_date: appointmentData.appointment_date,
        appointment_time: appointmentData.appointment_time,
        status: 'scheduled'
      })

      toast.success('¡Cita agendada exitosamente!')
      
      // Redirigir al dashboard del paciente
      setTimeout(() => {
        router.push('/paciente/dashboard')
      }, 2000)
    } catch (error: any) {
      console.error('Error creating appointment:', error)
      toast.error('Error al agendar la cita. Intenta nuevamente.')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setAppointmentData({
      ...appointmentData,
      [e.target.name]: e.target.value
    })
  }

  const handleLoginNavigation = () => {
    router.push('/paciente/login')
    // Verificar autenticación después de navegar
    setTimeout(() => {
      const patientData = localStorage.getItem('medcontrol_patient')
      if (patientData) {
        window.location.reload()
      }
    }, 2000)
  }

  const handleRegisterNavigation = () => {
    router.push('/registro')
    // Verificar autenticación después de navegar
    setTimeout(() => {
      const patientData = localStorage.getItem('medcontrol_patient')
      if (patientData) {
        window.location.reload()
      }
    }, 2000)
  }

  console.log('🎨 Renderizando, showLoginPrompt:', showLoginPrompt, 'loadingDoctors:', loadingDoctors, 'isInitialized:', isInitialized, 'isClient:', isClient)
  
  // No renderizar nada hasta que estemos en el cliente
  if (!isClient) {
    console.log('⏳ Esperando hidratación del cliente...')
    return (
      <div className="min-h-screen bg-gradient-to-br from-medical-50 to-primary-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    )
  }
  
  // No renderizar nada hasta que esté inicializado
  if (!isInitialized) {
    console.log('⏳ Esperando inicialización...')
    return (
      <div className="min-h-screen bg-gradient-to-br from-medical-50 to-primary-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando autenticación...</p>
        </div>
      </div>
    )
  }
  
  if (showLoginPrompt) {
    console.log('🔐 Mostrando prompt de login')
    return (
      <div className="min-h-screen bg-gradient-to-br from-medical-50 to-primary-50 flex items-center justify-center py-12">
        <div className="max-w-md w-full mx-4">
          <Card>
            <CardHeader className="text-center">
              <div className="flex items-center justify-center mb-4">
                <div className="bg-primary-600 p-3 rounded-full">
                  <Heart className="w-8 h-8 text-white" />
                </div>
              </div>
              <CardTitle className="text-2xl">Acceso Requerido</CardTitle>
              <CardDescription>
                Para agendar una cita, necesitas iniciar sesión o registrarte
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={handleLoginNavigation}
                className="w-full btn-primary py-3"
              >
                Iniciar Sesión
              </Button>
              <Button
                onClick={handleRegisterNavigation}
                variant="outline"
                className="w-full py-3"
              >
                Registrarse
              </Button>
              <div className="text-center space-y-2">
                <button
                  onClick={() => router.push('/')}
                  className="text-sm text-primary-600 hover:text-primary-700"
                >
                  Volver al inicio
                </button>
                <div>
                  <button
                    onClick={() => window.location.reload()}
                    className="text-xs text-gray-500 hover:text-gray-700"
                  >
                    ¿Problemas? Recargar página
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Verificación adicional de seguridad
  if (showLoginPrompt) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-medical-50 to-primary-50 flex items-center justify-center py-12">
        <div className="max-w-md w-full mx-4">
          <Card>
            <CardHeader className="text-center">
              <div className="flex items-center justify-center mb-4">
                <div className="bg-primary-600 p-3 rounded-full">
                  <Heart className="w-8 h-8 text-white" />
                </div>
              </div>
              <CardTitle className="text-2xl">Acceso Requerido</CardTitle>
              <CardDescription>
                Para agendar una cita, necesitas iniciar sesión o registrarte
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={handleLoginNavigation}
                className="w-full btn-primary py-3"
              >
                Iniciar Sesión
              </Button>
              <Button
                onClick={handleRegisterNavigation}
                variant="outline"
                className="w-full py-3"
              >
                Registrarse
              </Button>
              <div className="text-center space-y-2">
                <button
                  onClick={() => router.push('/')}
                  className="text-sm text-primary-600 hover:text-primary-700"
                >
                  Volver al inicio
                </button>
                <div>
                  <button
                    onClick={() => window.location.reload()}
                    className="text-xs text-gray-500 hover:text-gray-700"
                  >
                    ¿Problemas? Recargar página
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (loadingDoctors) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-medical-50 to-primary-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando especialistas...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-medical-50 to-primary-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <div className="bg-primary-600 p-3 rounded-full">
                <Heart className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Agendar Cita Médica
            </h1>
            <p className="text-lg text-gray-600">
              Selecciona tu especialista y programa tu cita
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Selección de Especialidad y Doctor */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Selecciona tu Especialista
                </CardTitle>
                <CardDescription>
                  Primero elige la especialidad, luego el doctor
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Selección de Especialidad */}
                <div>
                  <label className="label">Especialidad *</label>
                  <select
                    value={selectedSpecialty}
                    onChange={(e) => handleSpecialtyChange(e.target.value)}
                    className="input-field"
                    required
                  >
                    <option value="">Selecciona una especialidad...</option>
                    {specialties.map((specialty) => (
                      <option key={specialty} value={specialty}>
                        {specialty}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Selección de Doctor */}
                {selectedSpecialty && (
                  <div>
                    <label className="label">Doctor *</label>
                    <select
                      value={selectedDoctor?.id || ''}
                      onChange={(e) => {
                        const doctor = filteredDoctors.find(d => d.id === e.target.value)
                        if (doctor) handleDoctorSelect(doctor)
                      }}
                      className="input-field"
                      required
                    >
                      <option value="">Selecciona un doctor...</option>
                      {filteredDoctors.map((doctor) => (
                        <option key={doctor.id} value={doctor.id}>
                          {doctor.full_name} {doctor.phone && `- ${doctor.phone}`}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Información del Doctor Seleccionado */}
                {selectedDoctor && (
                  <div className="p-4 bg-primary-50 border border-primary-200 rounded-lg">
                    <h3 className="font-medium text-primary-900 mb-2">
                      Doctor Seleccionado
                    </h3>
                    <p className="text-sm text-primary-700">
                      <strong>{selectedDoctor.full_name}</strong>
                    </p>
                    <p className="text-sm text-primary-600">
                      {selectedDoctor.specialty}
                    </p>
                    {selectedDoctor.phone && (
                      <p className="text-sm text-primary-600">
                        📞 {selectedDoctor.phone}
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Formulario de Cita */}
            {selectedDoctor && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Detalles de la Cita
                  </CardTitle>
                  <CardDescription>
                    Con {selectedDoctor.full_name} - {selectedDoctor.specialty}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Fecha */}
                    <div>
                      <label className="label">Fecha de la Cita *</label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                          type="date"
                          name="appointment_date"
                          value={appointmentData.appointment_date}
                          onChange={handleChange}
                          className="input-field pl-10"
                          min={new Date().toISOString().split('T')[0]}
                          required
                        />
                      </div>
                    </div>

                    {/* Hora */}
                    <div>
                      <label className="label">Hora de la Cita *</label>
                      <div className="relative">
                        <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                          type="time"
                          name="appointment_time"
                          value={appointmentData.appointment_time}
                          onChange={handleChange}
                          className="input-field pl-10"
                          required
                        />
                      </div>
                    </div>

                    {/* Motivo */}
                    <div>
                      <label className="label">Motivo de la Consulta *</label>
                      <input
                        type="text"
                        name="title"
                        value={appointmentData.title}
                        onChange={handleChange}
                        className="input-field"
                        placeholder="Ej: Consulta general, Dolor de cabeza, etc."
                        required
                      />
                    </div>

                    {/* Descripción */}
                    <div>
                      <label className="label">Descripción (Opcional)</label>
                      <textarea
                        name="description"
                        value={appointmentData.description}
                        onChange={handleChange}
                        className="input-field"
                        rows={3}
                        placeholder="Describe brevemente tu consulta..."
                      />
                    </div>

                    {/* Submit Button */}
                    <div className="pt-4">
                      <Button
                        type="submit"
                        disabled={loading}
                        className="btn-primary w-full py-3"
                      >
                        {loading ? 'Agendando...' : 'Confirmar Cita'}
                      </Button>
              </div>
                  </form>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Información Adicional */}
          <Card className="mt-8">
            <CardContent className="pt-6">
              <div className="text-center">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Información Importante
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                  <div className="flex items-center justify-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>Horario: 8:00 AM - 6:00 PM</span>
                </div>
                  <div className="flex items-center justify-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>Lunes a Viernes</span>
              </div>
                  <div className="flex items-center justify-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    <span>Confirmación por email</span>
              </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="text-center mt-8">
            <p className="text-sm text-gray-500">
              ¿Necesitas ayuda?{' '}
              <button
                onClick={() => router.push('/')}
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                Contacta con nosotros
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}