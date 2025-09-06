'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Mail, Send, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'

export default function TestEmailRealPage() {
  const [email, setEmail] = useState('ana@gmail.com') // Email de ana navarro
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const testRealEmail = async () => {
    if (!email) {
      toast.error('Por favor ingresa un email')
      return
    }

    setLoading(true)
    setResult(null)

    try {
      console.log('📧 Enviando correo de prueba a:', email)
      
      const response = await fetch('/api/email/demo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          patientName: 'Ana Navarro',
          patientEmail: email,
          doctorName: 'Dr. María García',
          doctorSpecialty: 'Medicina General',
          appointmentDate: '2025-09-06',
          appointmentTime: '14:08',
          appointmentTitle: 'Cita con doc1',
          appointmentDescription: 'hehehkxkjdnsdkds',
          clinicName: 'MedControl - Consultorio Principal',
          clinicAddress: 'Calle 123 #45-67, Bogotá, Colombia',
          clinicPhone: '+57 (1) 234-5678'
        })
      })

      const data = await response.json()
      setResult(data)
      
      if (data.success) {
        toast.success('Correo de prueba enviado exitosamente')
        console.log('✅ Correo enviado:', data)
      } else {
        toast.error('Error enviando correo: ' + data.error)
        console.error('❌ Error:', data)
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error enviando correo de prueba')
      setResult({ success: false, error: error.message })
    } finally {
      setLoading(false)
    }
  }

  const testWithRealSMTP = async () => {
    if (!email) {
      toast.error('Por favor ingresa un email')
      return
    }

    setLoading(true)
    setResult(null)

    try {
      console.log('📧 Enviando correo con SMTP real a:', email)
      
      const response = await fetch('/api/email/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: email,
          subject: 'Test de Correo Real - MedControl',
          text: 'Este es un correo de prueba del sistema MedControl con configuración SMTP real.',
          html: `
            <h1>Test de Correo Real - MedControl</h1>
            <p>Este es un correo de prueba del sistema MedControl con configuración SMTP real.</p>
            <p><strong>Paciente:</strong> Ana Navarro</p>
            <p><strong>Fecha:</strong> ${new Date().toLocaleString()}</p>
            <p>Si recibes este correo, la configuración SMTP está funcionando correctamente.</p>
          `
        })
      })

      const data = await response.json()
      setResult(data)
      
      if (data.success) {
        toast.success('Correo SMTP real enviado exitosamente')
        console.log('✅ Correo SMTP enviado:', data)
      } else {
        toast.error('Error enviando correo SMTP: ' + data.error)
        console.error('❌ Error SMTP:', data)
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error enviando correo SMTP')
      setResult({ success: false, error: error.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            📧 Test de Correo Real
          </h1>
          <p className="text-gray-600">
            Prueba el envío de correos para Ana Navarro
          </p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Enviar Correo de Prueba</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="email">Email de Ana Navarro</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ana@gmail.com"
              />
            </div>
            
            <div className="flex gap-2">
              <Button
                onClick={testRealEmail}
                disabled={loading}
                className="flex-1"
              >
                <Send className="w-4 h-4 mr-2" />
                Test Demo
              </Button>
              
              <Button
                onClick={testWithRealSMTP}
                disabled={loading}
                variant="outline"
                className="flex-1"
              >
                <Mail className="w-4 h-4 mr-2" />
                Test SMTP Real
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

                {result.demo && (
                  <div className="flex items-center gap-2 text-yellow-600">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-sm">Modo Demo - Revisa la consola del servidor</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>📋 Configuración de Correo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-yellow-50 p-4 rounded-lg">
                <h3 className="font-semibold text-yellow-900 mb-2">⚠️ Estado Actual</h3>
                <p className="text-sm text-yellow-800">
                  Las credenciales de correo están configuradas con valores de ejemplo, por lo que el sistema funciona en modo demo.
                </p>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-2">🔧 Para Configurar Correos Reales</h3>
                <p className="text-sm text-blue-800 mb-2">
                  Edita el archivo <code>.env.local</code> y cambia:
                </p>
                <pre className="text-xs bg-gray-100 p-2 rounded">
{`SMTP_USER=tu-email-real@gmail.com
SMTP_PASS=tu-password-real-de-aplicacion`}
                </pre>
                <p className="text-sm text-blue-800 mt-2">
                  Luego reinicia el servidor con <code>npm run dev</code>
                </p>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-semibold text-green-900 mb-2">🧪 Pruebas</h3>
                <ul className="text-sm text-green-800 space-y-1 list-disc list-inside">
                  <li><strong>Test Demo:</strong> Simula el envío (revisa la consola del servidor)</li>
                  <li><strong>Test SMTP Real:</strong> Intenta enviar con credenciales reales</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


