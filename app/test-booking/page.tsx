'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar, Clock, User, Mail, Phone, MapPin } from 'lucide-react'
import { toast } from 'react-hot-toast'

export default function TestBookingPage() {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [formData, setFormData] = useState({
    patientName: 'Juan Pérez',
    patientEmail: 'juan.perez@example.com',
    patientPhone: '+57 300 123 4567',
    doctorName: 'Dr. Carlos García',
    doctorSpecialty: 'Cardiología',
    appointmentDate: '2024-01-15',
    appointmentTime: '10:00',
    appointmentTitle: 'Consulta de Cardiología',
    appointmentDescription: 'Revisión general del corazón y sistema cardiovascular'
  })

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Simular creación de cita
      console.log('📅 Creando cita de prueba...')
      
      // Enviar correo de confirmación
      const response = await fetch('/api/email/demo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          patientEmail: formData.patientEmail,
          patientName: formData.patientName
        })
      })

      const result = await response.json()

      if (result.success) {
        setSuccess(true)
        toast.success('¡Cita agendada y correo enviado exitosamente!')
      } else {
        throw new Error(result.error)
      }
    } catch (error: any) {
      console.error('Error:', error)
      toast.error('Error al agendar la cita: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12">
        <div className="max-w-md w-full mx-4">
          <Card>
            <CardHeader className="text-center">
              <div className="flex items-center justify-center mb-4">
                <div className="bg-green-500 p-3 rounded-full">
                  <Calendar className="w-8 h-8 text-white" />
                </div>
              </div>
              <CardTitle className="text-2xl text-green-600">¡Cita Agendada!</CardTitle>
              <CardDescription>
                La cita ha sido programada y se ha enviado un correo de confirmación
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-semibold text-green-800 mb-2">Detalles de la Cita:</h3>
                <div className="space-y-1 text-sm text-green-700">
                  <p><strong>Paciente:</strong> {formData.patientName}</p>
                  <p><strong>Doctor:</strong> {formData.doctorName}</p>
                  <p><strong>Especialidad:</strong> {formData.doctorSpecialty}</p>
                  <p><strong>Fecha:</strong> {formData.appointmentDate}</p>
                  <p><strong>Hora:</strong> {formData.appointmentTime}</p>
                </div>
              </div>
              <Button
                onClick={() => setSuccess(false)}
                className="w-full"
                variant="outline"
              >
                Agendar Otra Cita
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🏥 Prueba de Agendamiento con Correo
          </h1>
          <p className="text-gray-600">
            Prueba el sistema completo de agendamiento con envío de correos
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Agendar Cita de Prueba
            </CardTitle>
            <CardDescription>
              Completa los datos para probar el agendamiento y envío de correo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Información del Paciente */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Información del Paciente
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="patientName">Nombre Completo</Label>
                    <Input
                      id="patientName"
                      value={formData.patientName}
                      onChange={(e) => handleChange('patientName', e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="patientEmail">Email</Label>
                    <Input
                      id="patientEmail"
                      type="email"
                      value={formData.patientEmail}
                      onChange={(e) => handleChange('patientEmail', e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="patientPhone">Teléfono</Label>
                    <Input
                      id="patientPhone"
                      value={formData.patientPhone}
                      onChange={(e) => handleChange('patientPhone', e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Información del Doctor */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Información del Doctor
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="doctorName">Nombre del Doctor</Label>
                    <Input
                      id="doctorName"
                      value={formData.doctorName}
                      onChange={(e) => handleChange('doctorName', e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="doctorSpecialty">Especialidad</Label>
                    <Select
                      value={formData.doctorSpecialty}
                      onValueChange={(value) => handleChange('doctorSpecialty', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Cardiología">Cardiología</SelectItem>
                        <SelectItem value="Dermatología">Dermatología</SelectItem>
                        <SelectItem value="Pediatría">Pediatría</SelectItem>
                        <SelectItem value="Medicina General">Medicina General</SelectItem>
                        <SelectItem value="Neurología">Neurología</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Información de la Cita */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Información de la Cita
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="appointmentDate">Fecha</Label>
                    <Input
                      id="appointmentDate"
                      type="date"
                      value={formData.appointmentDate}
                      onChange={(e) => handleChange('appointmentDate', e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="appointmentTime">Hora</Label>
                    <Input
                      id="appointmentTime"
                      type="time"
                      value={formData.appointmentTime}
                      onChange={(e) => handleChange('appointmentTime', e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="appointmentTitle">Motivo de la Consulta</Label>
                  <Input
                    id="appointmentTitle"
                    value={formData.appointmentTitle}
                    onChange={(e) => handleChange('appointmentTitle', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="appointmentDescription">Descripción (Opcional)</Label>
                  <Textarea
                    id="appointmentDescription"
                    value={formData.appointmentDescription}
                    onChange={(e) => handleChange('appointmentDescription', e.target.value)}
                    rows={3}
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full py-3"
              >
                {loading ? (
                  <>
                    <Clock className="w-4 h-4 mr-2 animate-spin" />
                    Agendando y Enviando Correo...
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4 mr-2" />
                    Agendar Cita y Enviar Correo
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="mt-8 bg-blue-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">
            📧 Información sobre el Correo
          </h3>
          <div className="text-sm text-blue-800 space-y-2">
            <p>• Se enviará un correo de confirmación al email del paciente</p>
            <p>• El correo incluirá todos los detalles de la cita</p>
            <p>• Actualmente está en modo demo (no se envían correos reales)</p>
            <p>• Para envío real, configura las credenciales SMTP en .env.local</p>
          </div>
        </div>
      </div>
    </div>
  )
}


