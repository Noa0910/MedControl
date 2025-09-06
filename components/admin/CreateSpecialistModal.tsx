'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Alert, AlertDescription } from '@/components/ui/Alert'
import { X, User, Mail, Phone, Stethoscope } from 'lucide-react'

interface CreateSpecialistModalProps {
  onClose: () => void
  onSuccess: (specialist: any) => void
}

export default function CreateSpecialistModal({ onClose, onSuccess }: CreateSpecialistModalProps) {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    specialty: '',
    phone: '',
    role: 'doctor' as 'doctor' | 'admin' | 'nurse',
    password: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Validar datos
      if (!formData.full_name || !formData.email || !formData.specialty || !formData.password) {
        setError('Todos los campos son obligatorios')
        return
      }

      // Crear el especialista usando la API
      const { apiClient } = await import('@/lib/api-client')
      const newSpecialist = await apiClient.createDoctor({
        email: formData.email,
        full_name: formData.full_name,
        role: formData.role,
        specialty: formData.specialty,
        phone: formData.phone
      })

      // Crear credenciales para el nuevo especialista
      await apiClient.createCredentials({
        doctor_id: newSpecialist.id,
        email: formData.email,
        password: formData.password
      })

      onSuccess(newSpecialist)
    } catch (error: any) {
      console.error('Error creating specialist:', error)
      
      // Handle specific error messages
      if (error.message?.includes('email ya está registrado')) {
        setError('El email ya está registrado. Por favor usa un email diferente.')
      } else if (error.message?.includes('Failed to create doctor')) {
        setError('Error al crear el doctor. Verifica que todos los campos estén correctos.')
      } else if (error.message?.includes('Failed to create credentials')) {
        setError('Error al crear las credenciales. El doctor se creó pero no se pudieron asignar las credenciales.')
      } else {
        setError(error.message || 'Error al crear el especialista')
      }
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-primary-600" />
              <CardTitle>Nuevo Especialista</CardTitle>
            </div>
            <Button variant="outline" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
          <CardDescription>
            Crea un nuevo especialista para el sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert className="border-red-200 bg-red-50">
                <AlertDescription className="text-red-800">{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="full_name">Nombre Completo</Label>
              <Input
                id="full_name"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                placeholder="Dr. Juan Pérez"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="dr.perez@medcontrol.com"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="specialty">Especialidad</Label>
              <Input
                id="specialty"
                name="specialty"
                value={formData.specialty}
                onChange={handleChange}
                placeholder="Cardiología"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono</Label>
              <Input
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+57 300 123 4567"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Rol</Label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              >
                <option value="doctor">Especialista</option>
                <option value="admin">Administrador</option>
                <option value="nurse">Enfermera</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Contraseña Temporal</Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
              />
              <p className="text-xs text-gray-500">
                El especialista podrá cambiar esta contraseña al iniciar sesión
              </p>
            </div>

            <div className="flex space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="flex-1"
              >
                {loading ? 'Creando...' : 'Crear Especialista'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

