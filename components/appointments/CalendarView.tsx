'use client'

import { useState, useEffect } from 'react'
import { format, parseISO, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay, addMonths, subMonths, getDay } from 'date-fns'
import { es } from 'date-fns/locale'
import { 
  Calendar, 
  Clock, 
  User, 
  Phone, 
  Mail, 
  ChevronLeft, 
  ChevronRight,
  Grid3X3,
  CalendarDays,
  Clock3
} from 'lucide-react'
import { useAuth } from '@/components/providers/AuthProvider'
import { apiClient } from '@/lib/api-client'
import AppointmentActionButton from './AppointmentActionButton'

interface Patient {
  first_name: string
  last_name: string
  phone?: string
  email?: string
}

interface Appointment {
  id: string
  appointment_date: string
  appointment_time: string
  duration: number
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show'
  reason: string
  title: string
  description?: string
  notes?: string
  patients: Patient
  created_at: string
}

type ViewMode = 'month' | 'week' | 'day'

export default function CalendarView() {
  const { user } = useAuth()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<ViewMode>('month')
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [currentTime, setCurrentTime] = useState(new Date())

  // Función para actualizar citas
  const handleUpdateAppointment = async (appointmentId: string, updates: any) => {
    try {
      console.log('Actualizando cita:', appointmentId, updates)
      
      // Llamar a la API para actualizar la cita
      await apiClient.updateAppointment(appointmentId, updates)
      
      // Actualizar el estado local
      setAppointments(prev => prev.map(apt => 
        apt.id === appointmentId 
          ? { ...apt, ...updates }
          : apt
      ))
      
      console.log('✅ Cita actualizada correctamente')
    } catch (error) {
      console.error('Error updating appointment:', error)
      throw error // Re-lanzar para que el modal pueda manejarlo
    }
  }

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
              email: patient.email,
              date_of_birth: patient.date_of_birth,
              gender: patient.gender,
              address: patient.address
            } : {
              first_name: 'Paciente',
              last_name: 'No encontrado',
              phone: '',
              email: '',
              date_of_birth: '',
              gender: '',
              address: ''
            }
          }
        })

        console.log('📅 Citas procesadas para calendario:', appointmentsWithPatients)
        console.log('📅 Fechas de citas:', appointmentsWithPatients.map(a => a.appointment_date))
        setAppointments(appointmentsWithPatients)
      } catch (error) {
        console.error('Error fetching appointments:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAppointments()
  }, [user])

  // Actualizar tiempo cada minuto para alertas en tiempo real
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000) // Actualizar cada minuto

    return () => clearInterval(interval)
  }, [])

  // Función para obtener citas de un día específico
  const getAppointmentsForDate = (date: Date) => {
    const dateString = format(date, 'yyyy-MM-dd')
    
    const dayAppointments = appointments.filter(appointment => {
      // Convertir appointment_date a formato de fecha si viene con hora
      let appointmentDate = appointment.appointment_date
      if (appointmentDate.includes('T')) {
        appointmentDate = appointmentDate.split('T')[0]
      }
      
      const dateMatches = appointmentDate === dateString
      // Solo mostrar citas activas (scheduled, confirmed) - no mostrar completadas, canceladas o no asistió
      const statusMatches = appointment.status === 'scheduled' || appointment.status === 'confirmed'
      
      return dateMatches && statusMatches
    }).sort((a, b) => a.appointment_time.localeCompare(b.appointment_time))
    
    return dayAppointments
  }

  // Función para obtener el color según el estado
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'confirmed': return 'bg-green-100 text-green-800 border-green-200'
      case 'completed': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200'
      case 'no_show': return 'bg-orange-100 text-orange-800 border-orange-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  // Función para obtener el texto del estado
  const getStatusText = (status: string) => {
    switch (status) {
      case 'scheduled': return 'Programada'
      case 'confirmed': return 'Confirmada'
      case 'completed': return 'Completada'
      case 'cancelled': return 'Cancelada'
      case 'no_show': return 'No asistió'
      default: return status
    }
  }

  // Función para verificar si hay alerta
  const getAlertType = (appointment: Appointment) => {
    // Extraer solo la fecha sin zona horaria
    let appointmentDate = appointment.appointment_date
    if (appointmentDate.includes('T')) {
      appointmentDate = appointmentDate.split('T')[0]
    }
    
    const appointmentDateTime = new Date(`${appointmentDate}T${appointment.appointment_time}`)
    const diffMs = appointmentDateTime.getTime() - currentTime.getTime()
    
    console.log(`🔍 Verificando alerta para ${appointment.patients.first_name} ${appointment.patients.last_name}:`)
    console.log(`   Fecha cita original: ${appointment.appointment_date}`)
    console.log(`   Fecha cita procesada: ${appointmentDate}`)
    console.log(`   Hora cita: ${appointment.appointment_time}`)
    console.log(`   Fecha completa: ${appointmentDateTime.toISOString()}`)
    console.log(`   Hora actual: ${format(currentTime, 'yyyy-MM-dd HH:mm:ss')}`)
    console.log(`   Diferencia: ${Math.floor(diffMs / (1000 * 60))} minutos`)
    
    if (isNaN(diffMs)) {
      console.log(`   ❌ ERROR: Diferencia inválida`)
      return null
    }
    
    if (diffMs < 0) {
      console.log(`   ✅ ALERTA VENCIDA`)
      return 'overdue'
    }
    if (diffMs <= 15 * 60 * 1000) {
      console.log(`   🚨 ALERTA URGENTE (≤15 min)`)
      return 'urgent'
    }
    if (diffMs <= 60 * 60 * 1000) {
      console.log(`   ⚠️ ALERTA PRÓXIMA (≤1 hora)`)
      return 'warning'
    }
    console.log(`   ❌ Sin alerta`)
    return null
  }

  // Función para obtener el tiempo hasta la cita
  const getTimeUntilAppointment = (appointment: Appointment) => {
    // Extraer solo la fecha sin zona horaria
    let appointmentDate = appointment.appointment_date
    if (appointmentDate.includes('T')) {
      appointmentDate = appointmentDate.split('T')[0]
    }
    
    const appointmentDateTime = new Date(`${appointmentDate}T${appointment.appointment_time}`)
    const diffMs = appointmentDateTime.getTime() - currentTime.getTime()
    
    if (isNaN(diffMs)) {
      return 'Error de fecha'
    }
    
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
        alertType: getAlertType(appointment),
        timeUntil: getTimeUntilAppointment(appointment)
      }))
      .filter(appointment => appointment.alertType !== null)
      .sort((a, b) => {
        const now = new Date()
        const aTime = new Date(`${a.appointment_date}T${a.appointment_time}`).getTime()
        const bTime = new Date(`${b.appointment_date}T${b.appointment_time}`).getTime()
        return aTime - bTime
      })
  }

  // Renderizar vista mensual
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
      <div className="bg-white rounded-lg shadow-lg border">
        {/* Header del calendario */}
        <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
          <h2 className="text-2xl font-bold text-gray-800">
            {format(currentDate, 'MMMM yyyy', { locale: es })}
          </h2>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setCurrentDate(subMonths(currentDate, 1))}
              className="p-2 hover:bg-white rounded-full transition-colors duration-200"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            <button
              onClick={() => setCurrentDate(new Date())}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
            >
              Hoy
            </button>
            <button
              onClick={() => setCurrentDate(addMonths(currentDate, 1))}
              className="p-2 hover:bg-white rounded-full transition-colors duration-200"
            >
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Días de la semana */}
        <div className="grid grid-cols-7 border-b bg-gray-50">
          {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map(day => (
            <div key={day} className="p-4 text-center text-sm font-semibold text-gray-600 uppercase tracking-wide">
              {day}
            </div>
          ))}
        </div>

        {/* Días del mes */}
        <div className="grid grid-cols-7">
          {days.map(day => {
            const dayAppointments = getAppointmentsForDate(day)
            const isCurrentMonth = isSameMonth(day, currentDate)
            const isToday = isSameDay(day, new Date())
            const isSelected = selectedDate && isSameDay(day, selectedDate)

            return (
              <div
                key={day.toISOString()}
                className={`min-h-[140px] border-r border-b p-3 ${
                  isCurrentMonth ? 'bg-white' : 'bg-gray-50'
                } ${isToday ? 'bg-blue-50 border-blue-200' : ''} ${isSelected ? 'bg-blue-100' : ''} hover:bg-gray-50 cursor-pointer transition-colors duration-200`}
                onClick={() => setSelectedDate(day)}
              >
                <div className={`text-lg font-semibold mb-2 ${
                  isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
                } ${isToday ? 'text-blue-600 bg-blue-100 rounded-full w-8 h-8 flex items-center justify-center' : ''}`}>
                  {format(day, 'd')}
                </div>
                
                <div className="space-y-1">
                  {dayAppointments.slice(0, 3).map((appointment, index) => {
                    const alert = getAlertType(appointment)
                    return (
                      <div
                        key={appointment.id}
                        className={`text-xs p-2 rounded-lg shadow-sm border ${
                          alert === 'urgent' ? 'bg-red-100 text-red-800 border-red-200' :
                          alert === 'warning' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                          alert === 'overdue' ? 'bg-red-200 text-red-900 border-red-300' :
                          index === 0 ? 'bg-blue-100 text-blue-800 border-blue-200' :
                          index === 1 ? 'bg-green-100 text-green-800 border-green-200' :
                          'bg-purple-100 text-purple-800 border-purple-200'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-xs">
                              {appointment.appointment_time}
                            </div>
                            <div className="truncate font-medium">
                              {appointment.patients.first_name} {appointment.patients.last_name}
                            </div>
                            <div className="truncate text-xs opacity-75">
                              {appointment.title || 'Sin motivo'}
                            </div>
                          </div>
                          <AppointmentActionButton
                            appointment={appointment}
                            onUpdate={handleUpdateAppointment}
                            compact={true}
                          />
                        </div>
                      </div>
                    )
                  })}
                  {dayAppointments.length > 3 && (
                    <div className="text-xs text-gray-500 font-medium">
                      +{dayAppointments.length - 3} más
                    </div>
                  )}
                  {dayAppointments.length === 0 && (
                    <div className="text-xs text-gray-400 italic">
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

  // Renderizar vista semanal
  const renderWeekView = () => {
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 })
    const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 })
    const days = []
    let day = weekStart

    while (day <= weekEnd) {
      days.push(day)
      day = addDays(day, 1)
    }

    return (
      <div className="bg-white rounded-lg shadow">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold">
            {format(weekStart, 'd MMM', { locale: es })} - {format(weekEnd, 'd MMM yyyy', { locale: es })}
          </h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentDate(addDays(currentDate, -7))}
              className="p-2 hover:bg-gray-100 rounded"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => setCurrentDate(new Date())}
              className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded hover:bg-blue-200"
            >
              Esta semana
            </button>
            <button
              onClick={() => setCurrentDate(addDays(currentDate, 7))}
              className="p-2 hover:bg-gray-100 rounded"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7">
          {days.map(day => {
            const dayAppointments = getAppointmentsForDate(day)
            const isToday = isSameDay(day, new Date())
            const isSelected = selectedDate && isSameDay(day, selectedDate)

            return (
              <div
                key={day.toISOString()}
                className={`min-h-[400px] border-r p-3 ${
                  isToday ? 'bg-blue-50' : 'bg-white'
                } ${isSelected ? 'bg-blue-100' : ''} hover:bg-gray-50 cursor-pointer`}
                onClick={() => setSelectedDate(day)}
              >
                <div className={`text-sm font-medium mb-3 ${
                  isToday ? 'text-blue-600' : 'text-gray-900'
                }`}>
                  {format(day, 'EEE d', { locale: es })}
                </div>
                
                <div className="space-y-2">
                  {dayAppointments.map(appointment => {
                    const alert = getAlertType(appointment)
                    return (
                      <div
                        key={appointment.id}
                        className={`p-2 rounded text-xs ${
                          alert === 'urgent' ? 'bg-red-200 text-red-800' :
                          alert === 'warning' ? 'bg-yellow-200 text-yellow-800' :
                          alert === 'overdue' ? 'bg-red-300 text-red-900' :
                          getStatusColor(appointment.status)
                        }`}
                      >
                        <div className="font-medium">
                          {appointment.appointment_time}
                        </div>
                        <div className="font-medium">
                          {appointment.patients.first_name} {appointment.patients.last_name}
                        </div>
                        <div className="truncate">
                          {appointment.title}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  // Renderizar vista diaria
  const renderDayView = () => {
    const dayAppointments = getAppointmentsForDate(currentDate)
    const isToday = isSameDay(currentDate, new Date())

    return (
      <div className="bg-white rounded-lg shadow">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold">
            {format(currentDate, 'EEEE, d MMMM yyyy', { locale: es })}
          </h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentDate(addDays(currentDate, -1))}
              className="p-2 hover:bg-gray-100 rounded"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => setCurrentDate(new Date())}
              className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded hover:bg-blue-200"
            >
              Hoy
            </button>
            <button
              onClick={() => setCurrentDate(addDays(currentDate, 1))}
              className="p-2 hover:bg-gray-100 rounded"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-4">
          {dayAppointments.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No hay citas programadas para este día</p>
            </div>
          ) : (
            <div className="space-y-4">
              {dayAppointments.map(appointment => {
                const alert = getAlertType(appointment)
                return (
                  <div
                    key={appointment.id}
                    className={`p-4 rounded-lg border ${
                      alert === 'urgent' ? 'border-red-300 bg-red-50' :
                      alert === 'warning' ? 'border-yellow-300 bg-yellow-50' :
                      alert === 'overdue' ? 'border-red-500 bg-red-100' :
                      'border-gray-200'
                    }`}
                  >
                    {alert && (
                      <div className={`mb-2 p-2 rounded text-sm font-medium ${
                        alert === 'urgent' ? 'bg-red-200 text-red-800' :
                        alert === 'warning' ? 'bg-yellow-200 text-yellow-800' :
                        'bg-red-300 text-red-900'
                      }`}>
                        {alert === 'urgent' ? '🚨 Cita urgente' :
                         alert === 'warning' ? '⚠️ Cita próxima' :
                         '❌ Cita vencida'}
                      </div>
                    )}

                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-medium">
                            {appointment.patients.first_name} {appointment.patients.last_name}
                          </h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                            {getStatusText(appointment.status)}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                          <div className="flex items-center text-sm text-gray-600">
                            <Clock className="w-4 h-4 mr-2" />
                            <span>{appointment.appointment_time} ({appointment.duration} min)</span>
                          </div>
                          {appointment.patients.phone && (
                            <div className="flex items-center text-sm text-gray-600">
                              <Phone className="w-4 h-4 mr-2" />
                              <span>{appointment.patients.phone}</span>
                            </div>
                          )}
                          {appointment.patients.email && (
                            <div className="flex items-center text-sm text-gray-600">
                              <Mail className="w-4 h-4 mr-2" />
                              <span>{appointment.patients.email}</span>
                            </div>
                          )}
                        </div>

                        <div className="mb-3">
                          <p className="text-sm font-medium text-gray-700 mb-1">Motivo de la consulta:</p>
                          <p className="text-sm text-gray-600">{appointment.title}</p>
                        </div>

                        {appointment.description && (
                          <div className="mb-3">
                            <p className="text-sm font-medium text-gray-700 mb-1">Descripción:</p>
                            <p className="text-sm text-gray-600">{appointment.description}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // Panel de alertas
  const renderAlertsPanel = () => {
    const appointmentsWithAlerts = getAppointmentsWithAlerts()
    
    if (appointmentsWithAlerts.length === 0) {
      return null
    }

    return (
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
                      <Clock className="w-4 h-4" />
                      <span>{appointment.appointment_time}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
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
    )
  }

  return (
    <div className="space-y-6">
      {/* Panel de alertas */}
      {renderAlertsPanel()}

      {/* Controles de vista */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setViewMode('month')}
            className={`flex items-center space-x-2 px-4 py-2 rounded ${
              viewMode === 'month' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-700'
            }`}
          >
            <Grid3X3 className="w-4 h-4" />
            <span>Mes</span>
          </button>
          <button
            onClick={() => setViewMode('week')}
            className={`flex items-center space-x-2 px-4 py-2 rounded ${
              viewMode === 'week' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-700'
            }`}
          >
            <CalendarDays className="w-4 h-4" />
            <span>Semana</span>
          </button>
          <button
            onClick={() => setViewMode('day')}
            className={`flex items-center space-x-2 px-4 py-2 rounded ${
              viewMode === 'day' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-700'
            }`}
          >
            <Clock3 className="w-4 h-4" />
            <span>Día</span>
          </button>
        </div>

        <div className="text-sm text-gray-600">
          Total: {appointments.length} citas
        </div>
      </div>

      {/* Vista del calendario */}
      {viewMode === 'month' && renderMonthView()}
      {viewMode === 'week' && renderWeekView()}
      {viewMode === 'day' && renderDayView()}
    </div>
  )
}
