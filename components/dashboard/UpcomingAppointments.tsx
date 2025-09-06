'use client'

import { useEffect, useState } from 'react'
import { Calendar, Clock, User, Phone } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import { getAppointments } from '@/lib/local-storage'
import { useCurrentDoctor } from '@/hooks/useCurrentDoctor'

interface Appointment {
  id: string
  appointment_date: string
  appointment_time: string
  reason: string
  status: string
  patients: {
    first_name: string
    last_name: string
    phone?: string
  }
}

export default function UpcomingAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const currentDoctor = useCurrentDoctor()

  useEffect(() => {
    const fetchAppointments = () => {
      try {
        if (!currentDoctor?.id) {
          setLoading(false)
          return
        }

        const allAppointments = getAppointments(currentDoctor.id)
        const today = new Date().toISOString().split('T')[0]
        
        const upcomingAppointments = allAppointments
          .filter(apt => apt.appointment_date >= today && ['scheduled', 'confirmed'].includes(apt.status))
          .sort((a, b) => {
            if (a.appointment_date === b.appointment_date) {
              return a.appointment_time.localeCompare(b.appointment_time)
            }
            return a.appointment_date.localeCompare(b.appointment_date)
          })
          .slice(0, 5)

        setAppointments(upcomingAppointments)
      } catch (error) {
        console.error('Error fetching appointments:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAppointments()
  }, [currentDoctor])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-yellow-100 text-yellow-800'
      case 'confirmed':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'Programada'
      case 'confirmed':
        return 'Confirmada'
      default:
        return status
    }
  }

  if (loading) {
    return (
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Próximas Citas</h3>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">Próximas Citas</h3>
        <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
          Ver todas
        </button>
      </div>

      {appointments.length === 0 ? (
        <div className="text-center py-6">
          <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500">No hay citas próximas</p>
        </div>
      ) : (
        <div className="space-y-4">
          {appointments.map((appointment) => (
            <div key={appointment.id} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-primary-600" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {appointment.patients.first_name} {appointment.patients.last_name}
                  </p>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                    {getStatusText(appointment.status)}
                  </span>
                </div>
                <div className="flex items-center mt-1 text-sm text-gray-500">
                  <Clock className="w-4 h-4 mr-1" />
                  <span>
                    {format(parseISO(appointment.appointment_date), 'dd MMM', { locale: es })} a las {appointment.appointment_time}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-1 truncate">
                  {appointment.reason}
                </p>
                {appointment.patients.phone && (
                  <div className="flex items-center mt-1 text-sm text-gray-500">
                    <Phone className="w-4 h-4 mr-1" />
                    <span>{appointment.patients.phone}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

