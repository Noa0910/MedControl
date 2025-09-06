'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Mail, Send, CheckCircle, XCircle, AlertCircle, Settings } from 'lucide-react'
import toast from 'react-hot-toast'

export default function TestSMTPStatusPage() {
  const [email, setEmail] = useState('test@example.com')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [smtpConfig, setSmtpConfig] = useState<any>(null)

  const checkSMTPConfig = async () => {
    try {
      const response = await fetch('/api/email/config')
      const config = await response.json()
      setSmtpConfig(config)
      console.log('📧 Configuración SMTP:', config)
    } catch (error) {
      console.error('Error checking SMTP config:', error)
    }
  }

  const testSMTPConnection = async () => {
    if (!email) {
      toast.error('Por favor ingresa un email')
      return
    }

    setLoading(true)
    setResult(null)

    try {
      console.log('📧 Probando conexión SMTP...')
      
      const response = await fetch('/api/email/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          patientEmail: email,
          patientName: 'Usuario de Prueba'
        })
      })

      const data = await response.json()
      setResult(data)
      
      if (data.success) {
        toast.success('✅ Correo enviado exitosamente!')
        console.log('✅ Correo enviado:', data)
      } else {
        toast.error('❌ Error enviando correo: ' + data.error)
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

  const testDemoMode = async () => {
    if (!email) {
      toast.error('Por favor ingresa un email')
      return
    }

    setLoading(true)
    setResult(null)

    try {
      console.log('📧 Probando modo demo...')
      
      const response = await fetch('/api/email/demo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          patientName: 'Usuario de Prueba',
          patientEmail: email,
          doctorName: 'Dr. Test',
          doctorSpecialty: 'Medicina General',
          appointmentDate: '2024-01-15',
          appointmentTime: '10:00',
          appointmentTitle: 'Cita de Prueba',
          appointmentDescription: 'Esta es una cita de prueba para verificar el sistema',
          clinicName: 'MedControl - Consultorio Principal',
          clinicAddress: 'Calle 123 #45-67, Bogotá, Colombia',
          clinicPhone: '+57 (1) 234-5678'
        })
      })

      const data = await response.json()
      setResult(data)
      
      if (data.success) {
        toast.success('✅ Modo demo funcionando!')
        console.log('✅ Modo demo:', data)
      } else {
        toast.error('❌ Error en modo demo: ' + data.error)
        console.error('❌ Error:', data)
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error en modo demo')
      setResult({ success: false, error: error.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            📧 Test de Sistema de Correos
          </h1>
          <p className="text-gray-600">
            Verifica el estado y funcionamiento del sistema de correos con Nodemailer
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Configuración SMTP */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Configuración SMTP
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={checkSMTPConfig}
                className="w-full"
                variant="outline"
              >
                Verificar Configuración
              </Button>

              {smtpConfig && (
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Host:</span>
                    <span className="text-gray-600">{smtpConfig.host}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Puerto:</span>
                    <span className="text-gray-600">{smtpConfig.port}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Usuario:</span>
                    <span className="text-gray-600">{smtpConfig.user}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Configurado:</span>
                    <span className={`px-2 py-1 rounded text-xs ${
                      smtpConfig.configured ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {smtpConfig.configured ? 'Sí' : 'No'}
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Test de Correo */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5" />
                Test de Correo
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="email">Email de Prueba</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="test@example.com"
                />
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={testSMTPConnection}
                  disabled={loading}
                  className="flex-1"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Test SMTP Real
                </Button>
                
                <Button
                  onClick={testDemoMode}
                  disabled={loading}
                  variant="outline"
                  className="flex-1"
                >
                  <AlertCircle className="w-4 h-4 mr-2" />
                  Test Demo
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Resultado */}
        {result && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {result.success ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-600" />
                )}
                Resultado del Test
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

        {/* Información del Sistema */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>📋 Información del Sistema de Correos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-2">🔧 Librería Utilizada</h3>
                <p className="text-sm text-blue-800">
                  <strong>Nodemailer v7.0.6</strong> - Librería de Node.js para envío de correos electrónicos
                </p>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-semibold text-green-900 mb-2">✅ Funcionalidades</h3>
                <ul className="text-sm text-green-800 space-y-1 list-disc list-inside">
                  <li>Envío de correos de confirmación de citas</li>
                  <li>Correos HTML con diseño profesional</li>
                  <li>Soporte para múltiples proveedores SMTP</li>
                  <li>Modo demo para pruebas sin credenciales</li>
                  <li>Manejo de errores robusto</li>
                </ul>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg">
                <h3 className="font-semibold text-yellow-900 mb-2">⚠️ Estado Actual</h3>
                <p className="text-sm text-yellow-800">
                  El sistema está configurado con credenciales de ejemplo, por lo que funciona en modo demo.
                  Para envío real de correos, necesitas configurar credenciales SMTP válidas.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
