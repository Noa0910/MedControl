'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Mail, Send, CheckCircle, XCircle } from 'lucide-react'
import toast from 'react-hot-toast'

export default function TestEmailPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const testEmail = async () => {
    if (!email) {
      toast.error('Por favor ingresa un email')
      return
    }

    setLoading(true)
    setResult(null)

    try {
      const response = await fetch('/api/email/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: email,
          subject: 'Test de Correo - MedControl',
          text: 'Este es un correo de prueba del sistema MedControl.',
          html: `
            <h1>Test de Correo - MedControl</h1>
            <p>Este es un correo de prueba del sistema MedControl.</p>
            <p>Si recibes este correo, la configuración de correo está funcionando correctamente.</p>
            <p><strong>Fecha:</strong> ${new Date().toLocaleString()}</p>
          `
        })
      })

      const data = await response.json()
      setResult(data)
      
      if (data.success) {
        toast.success('Correo de prueba enviado exitosamente')
      } else {
        toast.error('Error enviando correo: ' + data.error)
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error enviando correo de prueba')
      setResult({ success: false, error: error.message })
    } finally {
      setLoading(false)
    }
  }

  const testAppointmentEmail = async () => {
    if (!email) {
      toast.error('Por favor ingresa un email')
      return
    }

    setLoading(true)
    setResult(null)

    try {
      const response = await fetch('/api/email/demo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          patientName: 'Juan Pérez',
          patientEmail: email,
          doctorName: 'Dr. María García',
          doctorSpecialty: 'Medicina General',
          appointmentDate: '2024-01-15',
          appointmentTime: '10:00',
          appointmentTitle: 'Consulta de Prueba',
          appointmentDescription: 'Esta es una cita de prueba para verificar el sistema de correos.',
          clinicName: 'MedControl - Consultorio Principal',
          clinicAddress: 'Calle 123 #45-67, Bogotá, Colombia',
          clinicPhone: '+57 (1) 234-5678'
        })
      })

      const data = await response.json()
      setResult(data)
      
      if (data.success) {
        toast.success('Correo de confirmación de cita enviado exitosamente')
      } else {
        toast.error('Error enviando correo: ' + data.error)
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error enviando correo de confirmación')
      setResult({ success: false, error: error.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            📧 Test de Correo
          </h1>
          <p className="text-gray-600">
            Prueba el sistema de envío de correos electrónicos
          </p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Configuración de Correo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="email">Email de Destino</Label>
              <Input
                id="email"
                type="email"
                placeholder="tu-email@ejemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            
            <div className="flex gap-2">
              <Button
                onClick={testEmail}
                disabled={loading}
                className="flex-1"
              >
                <Send className="w-4 h-4 mr-2" />
                Test Básico
              </Button>
              
              <Button
                onClick={testAppointmentEmail}
                disabled={loading}
                variant="outline"
                className="flex-1"
              >
                <Mail className="w-4 h-4 mr-2" />
                Test Cita
              </Button>
            </div>
          </CardContent>
        </Card>

        {result && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {result.success ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-600" />
                )}
                Resultado
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Estado:</span>
                  <span className={`px-2 py-1 rounded text-sm ${
                    result.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {result.success ? 'Exitoso' : 'Error'}
                  </span>
                </div>
                
                {result.messageId && (
                  <div className="text-sm text-gray-600">
                    <strong>Message ID:</strong> {result.messageId}
                  </div>
                )}
                
                {result.error && (
                  <div className="text-sm text-red-600">
                    <strong>Error:</strong> {result.error}
                  </div>
                )}
                
                {result.message && (
                  <div className="text-sm text-gray-600">
                    <strong>Mensaje:</strong> {result.message}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>📋 Instrucciones</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-yellow-50 p-4 rounded-lg">
                <h3 className="font-semibold text-yellow-900 mb-2">⚠️ Configuración Requerida</h3>
                <p className="text-sm text-yellow-800">
                  Para que funcione el envío de correos, necesitas configurar las variables de entorno en el archivo <code>.env.local</code>:
                </p>
                <pre className="text-xs bg-gray-100 p-2 rounded mt-2">
{`SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu-email@gmail.com
SMTP_PASS=tu-password-de-aplicacion`}
                </pre>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-2">🧪 Pruebas</h3>
                <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                  <li><strong>Test Básico:</strong> Envía un correo simple de prueba</li>
                  <li><strong>Test Cita:</strong> Envía un correo de confirmación de cita con formato HTML</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


