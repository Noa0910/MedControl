'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/providers/AuthProvider'
import { apiClient } from '@/lib/api-client'
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth } from 'date-fns'
import { es } from 'date-fns/locale'

export default function TestCalendarDebugPage() {
  const { user } = useAuth()
  const [appointments, setAppointments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [currentDate, setCurrentDate] = useState(new Date())

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        if (!user?.email) {
          setLoading(false)
          return
        }

        console.log('🔄 Cargando citas para doctor:', user.email)
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

        console.log('📅 Citas procesadas:', appointmentsWithPatients)
        setAppointments(appointmentsWithPatients)
      } catch (error) {
        console.error('Error fetching appointments:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAppointments()
  }, [user])

  // Función para obtener citas de un día específico
  const getAppointmentsForDate = (date: Date) => {
    const dateString = format(date, 'yyyy-MM-dd')
    console.log(`🔍 Buscando citas para fecha: ${dateString}`)
    
    const dayAppointments = appointments.filter(appointment => {
      const matches = appointment.appointment_date === dateString
      if (matches) {
        console.log(`✅ Cita encontrada: ${appointment.patients.first_name} ${appointment.patients.last_name} a las ${appointment.appointment_time}`)
      }
      return matches
    }).sort((a, b) => a.appointment_time.localeCompare(b.appointment_time))
    
    console.log(`📅 Total citas para ${dateString}: ${dayAppointments.length}`)
    return dayAppointments
  }

  if (loading) {
    return <div className="p-8">Cargando...</div>
  }

  // Renderizar vista mensual simplificada
  const renderMonthView = () => {
    const monthStart = startOfMonth(currentDate)
    const monthEnd = endOfMonth(currentDate)
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 })
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 })

    const days = []
    let day = startDate

    while (day <= endDate) {
      days.push(day)
      day = addDays(day, 1)
    }

    return (
      <div className="bg-white rounded-lg shadow">
        {/* Header del calendario */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold">
            {format(currentDate, 'MMMM yyyy', { locale: es })}
          </h2>
        </div>

        {/* Días de la semana */}
        <div className="grid grid-cols-7 border-b">
          {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map(day => (
            <div key={day} className="p-3 text-center text-sm font-medium text-gray-500">
              {day}
            </div>
          ))}
        </div>

        {/* Días del mes */}
        <div className="grid grid-cols-7">
          {days.map(day => {
            const dayAppointments = getAppointmentsForDate(day)
            const isCurrentMonth = isSameMonth(day, currentDate)
            const isToday = format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')

            return (
              <div
                key={day.toISOString()}
                className={`min-h-[120px] border-r border-b p-2 ${
                  isCurrentMonth ? 'bg-white' : 'bg-gray-50'
                } ${isToday ? 'bg-blue-50' : ''} hover:bg-gray-50`}
              >
                <div className={`text-sm font-medium mb-1 ${
                  isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
                } ${isToday ? 'text-blue-600' : ''}`}>
                  {format(day, 'd')}
                </div>
                
                <div className="space-y-1">
                  {dayAppointments.length > 0 ? (
                    dayAppointments.map(appointment => (
                      <div
                        key={appointment.id}
                        className="text-xs p-1 rounded bg-yellow-100 text-yellow-800"
                      >
                        <div className="font-medium">
                          {appointment.appointment_time}
                        </div>
                        <div className="truncate">
                          {appointment.patients.first_name} {appointment.patients.last_name}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-xs text-gray-400">
                      Sin citas
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          🧪 Test de Calendario con Debug
        </h1>

        <div className="mb-6 bg-blue-50 p-4 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2">📊 Información de Debug:</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Total de citas: {appointments.length}</li>
            <li>• Fechas únicas: {[...new Set(appointments.map(a => a.appointment_date))].join(', ')}</li>
            <li>• Usuario: {user?.email || 'No logueado'}</li>
          </ul>
        </div>

        {renderMonthView()}

        <div className="mt-6 bg-white rounded-lg shadow p-4">
          <h3 className="font-semibold mb-2">📅 Lista de todas las citas:</h3>
          <div className="space-y-2">
            {appointments.map(appointment => (
              <div key={appointment.id} className="text-sm p-2 bg-gray-50 rounded">
                <strong>{appointment.appointment_date}</strong> a las <strong>{appointment.appointment_time}</strong> - 
                {appointment.patients.first_name} {appointment.patients.last_name}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}


