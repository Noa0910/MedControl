'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Calendar, Clock, User, RefreshCw, Mail, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { apiClient } from '@/lib/api-client'

export default function DebugAnaAppointmentPage() {
  const [appointments, setAppointments] = useState<any[]>([])
  const [patients, setPatients] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [anaAppointments, setAnaAppointments] = useState<any[]>([])

  const loadData = async () => {
    setLoading(true)
    try {
      console.log('🔍 Buscando citas de Ana Navarro...')
      
      // Obtener todas las citas
      const allAppointments = await apiClient.getAppointments()
      console.log('📅 Todas las citas:', allAppointments)
      
      // Obtener todos los pacientes
      const allPatients = await apiClient.getPatients()
      console.log('👥 Todos los pacientes:', allPatients)

      // Buscar citas de Ana Navarro
      const anaPatient = allPatients.find(p => 
        p.first_name?.toLowerCase().includes('ana') || 
        p.last_name?.toLowerCase().includes('navarro') ||
        p.email?.toLowerCase().includes('ana')
      )
      
      console.log('👤 Paciente Ana encontrado:', anaPatient)

      if (anaPatient) {
        const anaAppointments = allAppointments.filter(appointment => 
          appointment.patient_id === anaPatient.id
        )
        console.log('📅 Citas de Ana:', anaAppointments)
        setAnaAppointments(anaAppointments)
      }

      setAppointments(allAppointments)
      setPatients(allPatients)
      
      toast.success(`Encontradas ${anaAppointments.length} citas de Ana`)
    } catch (error) {
      console.error('Error loading data:', error)
      toast.error('Error cargando datos')
    } finally {
      setLoading(false)
    }
  }

  const simulateEmailForAna = async () => {
    try {
      const anaPatient = patients.find(p => 
        p.first_name?.toLowerCase().includes('ana') || 
        p.last_name?.toLowerCase().includes('navarro') ||
        p.email?.toLowerCase().includes('ana')
      )

      if (!anaPatient) {
        toast.error('No se encontró a Ana Navarro')
        return
      }

      console.log('📧 Simulando envío de correo para Ana:', anaPatient)

      const response = await fetch('/api/email/demo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          patientName: `${anaPatient.first_name} ${anaPatient.last_name}`,
          patientEmail: anaPatient.email,
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
      console.log('📧 Resultado del correo:', data)
      
      if (data.success) {
        toast.success('Correo simulado enviado para Ana')
      } else {
        toast.error('Error enviando correo: ' + data.error)
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error enviando correo')
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-100 py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🔍 Debug - Cita de Ana Navarro
          </h1>
          <p className="text-gray-600">
            Verifica por qué no se envió el correo de confirmación
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Información General */}
          <Card>
            <CardHeader>
              <CardTitle>Información General</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Total Citas:</span>
                  <span className="text-blue-600">{appointments.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">Total Pacientes:</span>
                  <span className="text-green-600">{patients.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">Citas de Ana:</span>
                  <span className="text-purple-600">{anaAppointments.length}</span>
                </div>
              </div>

              <Button
                onClick={loadData}
                disabled={loading}
                className="w-full"
                variant="outline"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                {loading ? 'Cargando...' : 'Recargar Datos'}
              </Button>
            </CardContent>
          </Card>

          {/* Simular Correo */}
          <Card>
            <CardHeader>
              <CardTitle>Simular Correo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">
                Simula el envío de correo de confirmación para Ana Navarro
              </p>

              <Button
                onClick={simulateEmailForAna}
                className="w-full"
              >
                <Mail className="w-4 h-4 mr-2" />
                Simular Correo para Ana
              </Button>

              <div className="bg-yellow-50 p-3 rounded-lg">
                <div className="flex items-center gap-2 text-yellow-800">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm font-medium">Modo Demo</span>
                </div>
                <p className="text-xs text-yellow-700 mt-1">
                  Revisa la consola del servidor para ver los logs del correo
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Citas de Ana */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Citas de Ana Navarro ({anaAppointments.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {anaAppointments.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No se encontraron citas para Ana Navarro
              </div>
            ) : (
              <div className="space-y-4">
                {anaAppointments.map((appointment, index) => (
                  <div key={appointment.id || index} className="border rounded-lg p-4 bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <Clock className="w-4 h-4 text-yellow-500" />
                          <h3 className="text-lg font-medium text-gray-900">
                            {appointment.title || 'Cita sin título'}
                          </h3>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            {appointment.status}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                          <div className="flex items-center text-sm text-gray-600">
                            <Calendar className="w-4 h-4 mr-2" />
                            <span>{appointment.appointment_date}</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <Clock className="w-4 h-4 mr-2" />
                            <span>{appointment.appointment_time}</span>
                          </div>
                        </div>

                        <div className="mb-3">
                          <p className="text-sm font-medium text-gray-700 mb-1">Descripción:</p>
                          <p className="text-sm text-gray-600">{appointment.description || 'Sin descripción'}</p>
                        </div>

                        {/* Debug Info */}
                        <div className="text-xs text-gray-500 bg-gray-100 p-2 rounded">
                          <div><strong>ID de Cita:</strong> {appointment.id}</div>
                          <div><strong>ID de Paciente:</strong> {appointment.patient_id}</div>
                          <div><strong>ID de Doctor:</strong> {appointment.doctor_id}</div>
                          <div><strong>Creada:</strong> {appointment.created_at}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Todos los Pacientes */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Pacientes en la Base de Datos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {patients.map((patient, index) => (
                <div key={patient.id || index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div>
                    <span className="font-medium">{patient.first_name} {patient.last_name}</span>
                    <span className="text-sm text-gray-500 ml-2">({patient.email})</span>
                  </div>
                  <div className="text-xs text-gray-500">
                    ID: {patient.id}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


