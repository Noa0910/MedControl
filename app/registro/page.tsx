'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { apiClient } from '@/lib/api-client'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Heart, User, Mail, Phone, Calendar, MapPin } from 'lucide-react'
import toast from 'react-hot-toast'

export default function PatientRegistrationPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    date_of_birth: '',
    gender: '',
    address: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    password: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Crear paciente usando la API
      const newPatient = await apiClient.createPatient({
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        phone: formData.phone,
        date_of_birth: formData.date_of_birth,
        gender: formData.gender,
        address: formData.address,
        emergency_contact_name: formData.emergency_contact_name || undefined,
        emergency_contact_phone: formData.emergency_contact_phone || undefined,
        doctor_id: 'public' // Identificador especial para pacientes públicos
      })

      // Crear credenciales para el paciente
      await apiClient.createPatientCredentials({
        patient_id: newPatient.id,
        email: formData.email,
        password: formData.password
      })

      // Guardar datos del paciente en localStorage para mantener la sesión
      localStorage.setItem('medcontrol_patient', JSON.stringify(newPatient))
      
      toast.success('¡Registro exitoso! Ahora puedes agendar tu cita.')
      
      // Redirigir a la página de agendamiento
      router.push('/agendar')
    } catch (error: any) {
      console.error('Error creating patient:', error)
      toast.error('Error al crear el registro. Intenta nuevamente.')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-medical-50 to-primary-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <div className="bg-primary-600 p-3 rounded-full">
                <Heart className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Registro de Paciente
            </h1>
            <p className="text-lg text-gray-600">
              Completa tus datos para agendar tu cita médica
            </p>
          </div>

          {/* Registration Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Información Personal
              </CardTitle>
              <CardDescription>
                Todos los campos son obligatorios para completar tu registro
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Nombre y Apellido */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="label">Nombre *</label>
                    <input
                      type="text"
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleChange}
                      className="input-field"
                      placeholder="Tu nombre"
                      required
                    />
                  </div>
                  <div>
                    <label className="label">Apellido *</label>
                    <input
                      type="text"
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleChange}
                      className="input-field"
                      placeholder="Tu apellido"
                      required
                    />
                  </div>
                </div>

                {/* Email y Teléfono */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="label">Email *</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="input-field pl-10"
                        placeholder="tu@email.com"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="label">Teléfono *</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="input-field pl-10"
                        placeholder="300 123 4567"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Fecha de Nacimiento y Género */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="label">Fecha de Nacimiento *</label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="date"
                        name="date_of_birth"
                        value={formData.date_of_birth}
                        onChange={handleChange}
                        className="input-field pl-10"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="label">Género *</label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      className="input-field"
                      required
                    >
                      <option value="">Selecciona...</option>
                      <option value="male">Masculino</option>
                      <option value="female">Femenino</option>
                      <option value="other">Otro</option>
                    </select>
                  </div>
                </div>

                {/* Dirección */}
                <div>
                  <label className="label">Dirección *</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      className="input-field pl-10"
                      placeholder="Calle 123 #45-67, Ciudad"
                      required
                    />
                  </div>
                </div>

                {/* Contraseña */}
                <div>
                  <label className="label">Contraseña *</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="Mínimo 6 caracteres"
                    minLength={6}
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Usa esta contraseña para iniciar sesión y agendar citas
                  </p>
                </div>

                {/* Contacto de Emergencia */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Contacto de Emergencia (Opcional)
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="label">Nombre del Contacto</label>
                      <input
                        type="text"
                        name="emergency_contact_name"
                        value={formData.emergency_contact_name}
                        onChange={handleChange}
                        className="input-field"
                        placeholder="Nombre completo"
                      />
                    </div>
                    <div>
                      <label className="label">Teléfono del Contacto</label>
                      <input
                        type="tel"
                        name="emergency_contact_phone"
                        value={formData.emergency_contact_phone}
                        onChange={handleChange}
                        className="input-field"
                        placeholder="300 123 4567"
                      />
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end pt-6">
                  <Button
                    type="submit"
                    disabled={loading}
                    className="btn-primary px-8 py-3"
                  >
                    {loading ? 'Registrando...' : 'Registrarse y Agendar Cita'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="text-center mt-8">
            <p className="text-sm text-gray-500">
              ¿Ya tienes una cuenta?{' '}
              <button
                onClick={() => router.push('/')}
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                Iniciar sesión
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
