'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Mail, Send, CheckCircle, XCircle, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'
import { apiClient } from '@/lib/api-client'

export default function TestRealEmailPage() {
  const [patients, setPatients] = useState<any[]>([])
  const [doctors, setDoctors] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [selectedPatient, setSelectedPatient] = useState('')
  const [selectedDoctor, setSelectedDoctor] = useState('')
  const [appointmentData, setAppointmentData] = useState({
    title: 'Cita de Prueba - Correo',
    description: 'Esta es una cita de prueba para verificar el envío de correos',
    appointment_date: '',
    appointment_time: '',
    status: 'scheduled'
  })

  const loadData = async () => {
    setLoading(true)
    try {
      // Cargar pacientes
      const patientsResponse = await fetch('/api/database/patients')
      const patientsData = await patientsResponse.json()
      setPatients(patientsData)
      console.log('👥 Pacientes cargados:', patientsData)

      // Cargar doctores
      const doctorsResponse = await fetch('/api/database/doctors')
      const doctorsData = await doctorsResponse.json()
      setDoctors(doctorsData)
      console.log('👨‍⚕️ Doctores cargados:', doctorsData)

      toast.success('Datos cargados correctamente')
    } catch (error) {
      console.error('Error loading data:', error)
      toast.error('Error cargando datos')
    } finally {
      setLoading(false)
    }
  }

  const sendTestEmail = async () => {
    if (!selectedPatient || !selectedDoctor || !appointmentData.appointment_date || !appointmentData.appointment_time) {
      toast.error('Por favor completa todos los campos')
      return
    }

    const patient = patients.find(p => p.id === selectedPatient)
    const doctor = doctors.find(d => d.id === selectedDoctor)

    if (!patient || !doctor) {
      toast.error('Paciente o doctor no encontrado')
      return
    }

    setSending(true)
    setResult(null)

    try {
      // Crear la cita primero
      const appointment = {
        patient_id: selectedPatient,
        doctor_id: selectedDoctor,
        ...appointmentData
      }

      console.log('📅 Creando cita de prueba:', appointment)
      const createdAppointment = await apiClient.createAppointment(appointment)
      console.log('✅ Cita creada:', createdAppointment)

      toast.success('Cita creada y correo enviado (revisa la consola del servidor)')
      setResult({
        success: true,
        message: 'Cita creada exitosamente. Revisa la consola del servidor para ver los logs del correo.',
        appointment: createdAppointment,
        patient: patient,
        doctor: doctor
      })

      // Limpiar formulario
      setAppointmentData({
        title: 'Cita de Prueba - Correo',
        description: 'Esta es una cita de prueba para verificar el envío de correos',
        appointment_date: '',
        appointment_time: '',
        status: 'scheduled'
      })
      setSelectedPatient('')
      setSelectedDoctor('')

    } catch (error) {
      console.error('Error:', error)
      toast.error('Error creando cita: ' + error.message)
      setResult({ success: false, error: error.message })
    } finally {
      setSending(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            📧 Test de Correo Real
          </h1>
          <p className="text-gray-600">
            Prueba el envío de correos con datos reales de la base de datos
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Formulario de Prueba */}
          <Card>
            <CardHeader>
              <CardTitle>Crear Cita y Enviar Correo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="patient">Paciente</Label>
                <Select value={selectedPatient} onValueChange={setSelectedPatient}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un paciente" />
                  </SelectTrigger>
                  <SelectContent>
                    {patients.map((patient) => (
                      <SelectItem key={patient.id} value={patient.id}>
                        {patient.first_name} {patient.last_name} ({patient.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="doctor">Doctor</Label>
                <Select value={selectedDoctor} onValueChange={setSelectedDoctor}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un doctor" />
                  </SelectTrigger>
                  <SelectContent>
                    {doctors.map((doctor) => (
                      <SelectItem key={doctor.id} value={doctor.id}>
                        {doctor.full_name} ({doctor.specialty})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="title">Título de la Cita</Label>
                <Input
                  id="title"
                  value={appointmentData.title}
                  onChange={(e) => setAppointmentData(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="description">Descripción</Label>
                <Input
                  id="description"
                  value={appointmentData.description}
                  onChange={(e) => setAppointmentData(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="date">Fecha</Label>
                  <Input
                    id="date"
                    type="date"
                    value={appointmentData.appointment_date}
                    onChange={(e) => setAppointmentData(prev => ({ ...prev, appointment_date: e.target.value }))}
                  />
                </div>

                <div>
                  <Label htmlFor="time">Hora</Label>
                  <Input
                    id="time"
                    type="time"
                    value={appointmentData.appointment_time}
                    onChange={(e) => setAppointmentData(prev => ({ ...prev, appointment_time: e.target.value }))}
                  />
                </div>
              </div>

              <Button
                onClick={sendTestEmail}
                disabled={sending}
                className="w-full"
              >
                <Send className="w-4 h-4 mr-2" />
                {sending ? 'Creando Cita y Enviando Correo...' : 'Crear Cita y Enviar Correo'}
              </Button>
            </CardContent>
          </Card>

          {/* Información y Acciones */}
          <Card>
            <CardHeader>
              <CardTitle>Información</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Pacientes:</span>
                  <span className="text-blue-600">{patients.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">Doctores:</span>
                  <span className="text-green-600">{doctors.length}</span>
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

              <div className="bg-yellow-50 p-4 rounded-lg">
                <h3 className="font-semibold text-yellow-900 mb-2">⚠️ Importante</h3>
                <p className="text-sm text-yellow-800">
                  Este test creará una cita real en la base de datos y intentará enviar un correo de confirmación.
                  Revisa la consola del servidor para ver los logs del proceso de envío de correo.
                </p>
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

                {result.message && (
                  <div className="text-sm text-gray-600">
                    <strong>Mensaje:</strong> {result.message}
                  </div>
                )}

                {result.error && (
                  <div className="text-sm text-red-600">
                    <strong>Error:</strong> {result.error}
                  </div>
                )}

                {result.appointment && (
                  <div className="text-sm text-gray-600">
                    <strong>ID de Cita:</strong> {result.appointment.id}
                  </div>
                )}

                {result.patient && (
                  <div className="text-sm text-gray-600">
                    <strong>Paciente:</strong> {result.patient.first_name} {result.patient.last_name} ({result.patient.email})
                  </div>
                )}

                {result.doctor && (
                  <div className="text-sm text-gray-600">
                    <strong>Doctor:</strong> {result.doctor.full_name} ({result.doctor.specialty})
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}


