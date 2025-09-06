'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Calendar, Clock, User, Plus, RefreshCw, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { apiClient } from '@/lib/api-client'

export default function TestAppointmentsPage() {
  const [appointments, setAppointments] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [creating, setCreating] = useState(false)
  const [newAppointment, setNewAppointment] = useState({
    patient_id: 'test-patient-123',
    doctor_id: '',
    title: 'Cita de Prueba',
    description: 'Esta es una cita de prueba',
    appointment_date: '',
    appointment_time: '',
    status: 'scheduled'
  })

  const loadAppointments = async () => {
    setLoading(true)
    try {
      const allAppointments = await apiClient.getAppointments()
      console.log('📅 Todas las citas:', allAppointments)
      setAppointments(allAppointments)
      toast.success(`Cargadas ${allAppointments.length} citas`)
    } catch (error) {
      console.error('Error loading appointments:', error)
      toast.error('Error cargando citas')
    } finally {
      setLoading(false)
    }
  }

  const createTestAppointment = async () => {
    if (!newAppointment.appointment_date || !newAppointment.appointment_time) {
      toast.error('Por favor completa la fecha y hora')
      return
    }

    setCreating(true)
    try {
      const appointment = await apiClient.createAppointment(newAppointment)
      console.log('✅ Cita creada:', appointment)
      toast.success('Cita de prueba creada exitosamente')
      
      // Recargar citas
      await loadAppointments()
      
      // Limpiar formulario
      setNewAppointment({
        patient_id: 'test-patient-123',
        doctor_id: '',
        title: 'Cita de Prueba',
        description: 'Esta es una cita de prueba',
        appointment_date: '',
        appointment_time: '',
        status: 'scheduled'
      })
    } catch (error) {
      console.error('Error creating appointment:', error)
      toast.error('Error creando cita: ' + error.message)
    } finally {
      setCreating(false)
    }
  }

  const clearAppointments = () => {
    setAppointments([])
    toast.success('Lista de citas limpiada')
  }

  // Cargar citas al montar el componente
  useEffect(() => {
    loadAppointments()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            📅 Test de Citas
          </h1>
          <p className="text-gray-600">
            Prueba la creación y visualización de citas médicas
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Crear Cita de Prueba */}
          <Card>
            <CardHeader>
              <CardTitle>Crear Cita de Prueba</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Título</Label>
                <Input
                  id="title"
                  value={newAppointment.title}
                  onChange={(e) => setNewAppointment(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>
              
              <div>
                <Label htmlFor="description">Descripción</Label>
                <Input
                  id="description"
                  value={newAppointment.description}
                  onChange={(e) => setNewAppointment(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="date">Fecha</Label>
                  <Input
                    id="date"
                    type="date"
                    value={newAppointment.appointment_date}
                    onChange={(e) => setNewAppointment(prev => ({ ...prev, appointment_date: e.target.value }))}
                  />
                </div>
                
                <div>
                  <Label htmlFor="time">Hora</Label>
                  <Input
                    id="time"
                    type="time"
                    value={newAppointment.appointment_time}
                    onChange={(e) => setNewAppointment(prev => ({ ...prev, appointment_time: e.target.value }))}
                  />
                </div>
              </div>
              
              <Button
                onClick={createTestAppointment}
                disabled={creating}
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                {creating ? 'Creando...' : 'Crear Cita de Prueba'}
              </Button>
            </CardContent>
          </Card>

          {/* Acciones */}
          <Card>
            <CardHeader>
              <CardTitle>Acciones</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                onClick={loadAppointments}
                disabled={loading}
                className="w-full"
                variant="outline"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                {loading ? 'Cargando...' : 'Recargar Citas'}
              </Button>
              
              <Button
                onClick={clearAppointments}
                className="w-full"
                variant="destructive"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Limpiar Lista
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Lista de Citas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Citas Existentes ({appointments.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {appointments.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No hay citas registradas
              </div>
            ) : (
              <div className="space-y-4">
                {appointments.map((appointment, index) => (
                  <div key={appointment.id || index} className="border rounded-lg p-4 bg-gray-50">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h3 className="font-semibold text-gray-900">{appointment.title}</h3>
                        <p className="text-sm text-gray-600">{appointment.description}</p>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="w-4 h-4 text-blue-600" />
                          <span>{appointment.appointment_date}</span>
                        </div>
                        
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="w-4 h-4 text-green-600" />
                          <span>{appointment.appointment_time}</span>
                        </div>
                        
                        <div className="flex items-center gap-2 text-sm">
                          <User className="w-4 h-4 text-purple-600" />
                          <span>Paciente: {appointment.patient_id}</span>
                        </div>
                        
                        <div className="flex items-center gap-2 text-sm">
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                            {appointment.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Información de Debug */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>🔍 Información de Debug</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div><strong>Total de citas:</strong> {appointments.length}</div>
              <div><strong>Patient ID de prueba:</strong> test-patient-123</div>
              <div><strong>Última actualización:</strong> {new Date().toLocaleString()}</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


