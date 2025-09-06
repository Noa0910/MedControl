'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/providers/AuthProvider'
import { apiClient } from '@/lib/api-client'
import { format, addMinutes, subMinutes } from 'date-fns'

export default function TestAlertSimulationPage() {
  const { user } = useAuth()
  const [appointments, setAppointments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [simulatedTime, setSimulatedTime] = useState(new Date())
  const [isSimulating, setIsSimulating] = useState(false)

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        if (!user?.email) {
          setLoading(false)
          return
        }

        const allAppointments = await apiClient.getAppointments(user.email)
        const allPatients = await apiClient.getPatients()

        const appointmentsWithPatients = allAppointments.map(appointment => {
          const patient = allPatients.find(p => p.id === appointment.patient_id)
          
          return {
            ...appointment,
            duration: (appointment as any).duration || 30,
            reason: (appointment as any).reason || appointment.title || 'Sin motivo especificado',
            patients: patient ? {
              first_name: patient.first_name,
              last_name: patient.last_name,
              phone: patient.phone,
              email: patient.email
            } : {
              first_name: 'Paciente',
              last_name: 'No encontrado',
              phone: '',
              email: ''
            }
          }
        })

        setAppointments(appointmentsWithPatients)
      } catch (error) {
        console.error('Error fetching appointments:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAppointments()
  }, [user])

  // Función para verificar si hay alerta
  const getAlertType = (appointment: any, currentTime: Date) => {
    const appointmentDateTime = new Date(`${appointment.appointment_date}T${appointment.appointment_time}`)
    const diffMs = appointmentDateTime.getTime() - currentTime.getTime()
    
    console.log(`🔍 Verificando alerta para ${appointment.patients.first_name} ${appointment.patients.last_name}:`)
    console.log(`   Fecha cita: ${appointment.appointment_date} ${appointment.appointment_time}`)
    console.log(`   Hora simulada: ${format(currentTime, 'yyyy-MM-dd HH:mm:ss')}`)
    console.log(`   Diferencia: ${Math.floor(diffMs / (1000 * 60))} minutos`)
    
    if (diffMs < 0) return 'overdue'
    if (diffMs <= 15 * 60 * 1000) return 'urgent' // 15 minutos
    if (diffMs <= 60 * 60 * 1000) return 'warning' // 1 hora
    return null
  }

  // Función para obtener el tiempo hasta la cita
  const getTimeUntilAppointment = (appointment: any, currentTime: Date) => {
    const appointmentDateTime = new Date(`${appointment.appointment_date}T${appointment.appointment_time}`)
    const diffMs = appointmentDateTime.getTime() - currentTime.getTime()
    
    if (diffMs < 0) {
      const overdueMs = Math.abs(diffMs)
      const overdueMinutes = Math.floor(overdueMs / (1000 * 60))
      const overdueHours = Math.floor(overdueMinutes / 60)
      const overdueDays = Math.floor(overdueHours / 24)
      
      if (overdueDays > 0) return `Hace ${overdueDays} día${overdueDays > 1 ? 's' : ''}`
      if (overdueHours > 0) return `Hace ${overdueHours} hora${overdueHours > 1 ? 's' : ''}`
      return `Hace ${overdueMinutes} min`
    }
    
    const minutes = Math.floor(diffMs / (1000 * 60))
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)
    
    if (days > 0) return `En ${days} día${days > 1 ? 's' : ''}`
    if (hours > 0) return `En ${hours} hora${hours > 1 ? 's' : ''}`
    return `En ${minutes} min`
  }

  // Obtener citas con alertas
  const getAppointmentsWithAlerts = () => {
    return appointments
      .map(appointment => ({
        ...appointment,
        alertType: getAlertType(appointment, simulatedTime),
        timeUntil: getTimeUntilAppointment(appointment, simulatedTime)
      }))
      .filter(appointment => appointment.alertType !== null)
      .sort((a, b) => {
        const aTime = new Date(`${a.appointment_date}T${a.appointment_time}`).getTime()
        const bTime = new Date(`${b.appointment_date}T${b.appointment_time}`).getTime()
        return aTime - bTime
      })
  }

  // Simular tiempo cerca de una cita específica
  const simulateTimeNearAppointment = (appointment: any, minutesBefore: number) => {
    const appointmentDateTime = new Date(`${appointment.appointment_date}T${appointment.appointment_time}`)
    const simulatedDateTime = subMinutes(appointmentDateTime, minutesBefore)
    setSimulatedTime(simulatedDateTime)
    setIsSimulating(true)
  }

  // Resetear a tiempo real
  const resetToRealTime = () => {
    setSimulatedTime(new Date())
    setIsSimulating(false)
  }

  if (loading) {
    return <div className="p-8">Cargando...</div>
  }

  const appointmentsWithAlerts = getAppointmentsWithAlerts()

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          🧪 Simulador de Alertas de Citas
        </h1>

        <div className="mb-6 bg-blue-50 p-4 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2">⏰ Control de Tiempo:</h3>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-blue-800">
              <strong>Hora actual:</strong> {format(new Date(), 'HH:mm:ss')}
            </div>
            <div className="text-sm text-blue-800">
              <strong>Hora simulada:</strong> {format(simulatedTime, 'HH:mm:ss')}
            </div>
            {isSimulating && (
              <div className="text-sm text-orange-600 font-semibold">
                🎭 SIMULANDO
              </div>
            )}
          </div>
        </div>

        <div className="mb-6 bg-white rounded-lg shadow-lg border p-6">
          <h3 className="text-lg font-semibold mb-4">🎮 Controles de Simulación</h3>
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={resetToRealTime}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                ⏰ Tiempo Real
              </button>
              <button
                onClick={() => setSimulatedTime(addMinutes(simulatedTime, 30))}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                ⏩ +30 min
              </button>
              <button
                onClick={() => setSimulatedTime(subMinutes(simulatedTime, 30))}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                ⏪ -30 min
              </button>
            </div>
            
            <div className="text-sm text-gray-600">
              <strong>Simular cerca de cita específica:</strong>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {appointments.slice(0, 6).map(appointment => (
                <div key={appointment.id} className="space-y-2">
                  <div className="text-sm font-medium">
                    {appointment.patients.first_name} {appointment.patients.last_name}
                  </div>
                  <div className="text-xs text-gray-600">
                    {appointment.appointment_date} {appointment.appointment_time}
                  </div>
                  <div className="flex space-x-1">
                    <button
                      onClick={() => simulateTimeNearAppointment(appointment, 5)}
                      className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded hover:bg-red-200"
                    >
                      5 min antes
                    </button>
                    <button
                      onClick={() => simulateTimeNearAppointment(appointment, 30)}
                      className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded hover:bg-yellow-200"
                    >
                      30 min antes
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {appointmentsWithAlerts.length === 0 ? (
          <div className="bg-white rounded-lg shadow-lg border p-8 text-center">
            <div className="text-6xl mb-4">✅</div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              No hay alertas activas
            </h2>
            <p className="text-gray-600">
              Todas las citas están en horario normal
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-lg border mb-6">
            <div className="p-4 border-b bg-gradient-to-r from-orange-50 to-red-50">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                <h3 className="text-lg font-semibold text-gray-800">
                  Alertas de Citas ({appointmentsWithAlerts.length})
                </h3>
              </div>
            </div>
            
            <div className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {appointmentsWithAlerts.map(appointment => (
                  <div
                    key={appointment.id}
                    className={`p-4 rounded-lg border-l-4 shadow-sm ${
                      appointment.alertType === 'urgent' 
                        ? 'bg-red-50 border-red-500' 
                        : appointment.alertType === 'warning'
                        ? 'bg-yellow-50 border-yellow-500'
                        : 'bg-orange-50 border-orange-500'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        {appointment.alertType === 'urgent' && (
                          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                        )}
                        {appointment.alertType === 'warning' && (
                          <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                        )}
                        {appointment.alertType === 'overdue' && (
                          <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                        )}
                        <span className={`text-sm font-semibold ${
                          appointment.alertType === 'urgent' ? 'text-red-800' :
                          appointment.alertType === 'warning' ? 'text-yellow-800' :
                          'text-orange-800'
                        }`}>
                          {appointment.alertType === 'urgent' ? '🚨 URGENTE' :
                           appointment.alertType === 'warning' ? '⚠️ PRÓXIMA' :
                           '⏰ VENCIDA'}
                        </span>
                      </div>
                      <span className={`text-xs font-medium ${
                        appointment.alertType === 'urgent' ? 'text-red-600' :
                        appointment.alertType === 'warning' ? 'text-yellow-600' :
                        'text-orange-600'
                      }`}>
                        {appointment.timeUntil}
                      </span>
                    </div>
                    
                    <div className="space-y-1">
                      <h4 className="font-semibold text-gray-900">
                        {appointment.patients.first_name} {appointment.patients.last_name}
                      </h4>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <span>🕐</span>
                          <span>{appointment.appointment_time}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <span>📅</span>
                          <span>{format(new Date(appointment.appointment_date), 'dd/MM/yyyy')}</span>
                        </div>
                      </div>
                      {appointment.title && (
                        <p className="text-sm text-gray-700 truncate">
                          {appointment.title}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-lg border p-6">
          <h3 className="text-lg font-semibold mb-4">📋 Todas las Citas</h3>
          <div className="space-y-3">
            {appointments.map(appointment => {
              const alertType = getAlertType(appointment, simulatedTime)
              const timeUntil = getTimeUntilAppointment(appointment, simulatedTime)
              
              return (
                <div key={appointment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${
                      alertType === 'urgent' ? 'bg-red-500' :
                      alertType === 'warning' ? 'bg-yellow-500' :
                      alertType === 'overdue' ? 'bg-orange-500' :
                      'bg-gray-300'
                    }`}></div>
                    <div>
                      <span className="font-medium">
                        {appointment.patients.first_name} {appointment.patients.last_name}
                      </span>
                      <span className="text-gray-600 ml-2">
                        {appointment.appointment_date} {appointment.appointment_time}
                      </span>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600">
                    {timeUntil}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}


