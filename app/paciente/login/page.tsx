'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { apiClient } from '@/lib/api-client'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Heart, Mail, Lock, User } from 'lucide-react'
import toast from 'react-hot-toast'

export default function PatientLoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await apiClient.authenticatePatient(formData.email, formData.password)
      
      if (response.success && response.patient) {
        // Guardar datos del paciente en localStorage
        localStorage.setItem('medcontrol_patient', JSON.stringify(response.patient))
        
        toast.success(`¡Bienvenido, ${response.patient.first_name}!`)
        
        // Redirigir al dashboard del paciente
        router.push('/paciente/dashboard')
      } else {
        toast.error('Credenciales incorrectas. Verifica tu email y contraseña.')
      }
    } catch (error: any) {
      console.error('Error authenticating patient:', error)
      toast.error('Error al iniciar sesión. Intenta nuevamente.')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-medical-50 to-primary-50 flex items-center justify-center py-12">
      <div className="max-w-md w-full mx-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-primary-600 p-3 rounded-full">
              <Heart className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Iniciar Sesión
          </h1>
          <p className="text-gray-600">
            Accede a tu cuenta de paciente
          </p>
        </div>

        {/* Login Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Acceso de Paciente
            </CardTitle>
            <CardDescription>
              Ingresa tus credenciales para acceder a tu cuenta
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email */}
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

              {/* Password */}
              <div>
                <label className="label">Contraseña *</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="input-field pl-10"
                    placeholder="Tu contraseña"
                    required
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <Button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full py-3"
                >
                  {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Footer Links */}
        <div className="text-center mt-6 space-y-2">
          <p className="text-sm text-gray-500">
            ¿No tienes cuenta?{' '}
            <button
              onClick={() => router.push('/registro')}
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              Regístrate aquí
            </button>
          </p>
          <p className="text-sm text-gray-500">
            ¿Eres profesional de la salud?{' '}
            <button
              onClick={() => router.push('/')}
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              Iniciar sesión como doctor
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}


