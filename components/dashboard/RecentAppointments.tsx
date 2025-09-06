'use client'

import { useEffect, useState } from 'react'
import { CheckCircle, XCircle, Clock } from 'lucide-react'
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
  }
}

export default function RecentAppointments() {
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
        
        const recentAppointments = allAppointments
          .filter(apt => apt.appointment_date <= today && ['completed', 'cancelled', 'no_show'].includes(apt.status))
          .sort((a, b) => {
            if (a.appointment_date === b.appointment_date) {
              return b.appointment_time.localeCompare(a.appointment_time)
            }
            return b.appointment_date.localeCompare(a.appointment_date)
          })
          .slice(0, 5)

        setAppointments(recentAppointments)
      } catch (error) {
        console.error('Error fetching appointments:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAppointments()
  }, [currentDoctor])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-red-500" />
      case 'no_show':
        return <Clock className="w-5 h-5 text-yellow-500" />
      default:
        return <Clock className="w-5 h-5 text-gray-500" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Completada'
      case 'cancelled':
        return 'Cancelada'
      case 'no_show':
        return 'No asistió'
      default:
        return status
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600'
      case 'cancelled':
        return 'text-red-600'
      case 'no_show':
        return 'text-yellow-600'
      default:
        return 'text-gray-600'
    }
  }

  if (loading) {
    return (
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Citas Recientes</h3>
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
        <h3 className="text-lg font-medium text-gray-900">Citas Recientes</h3>
        <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
          Ver todas
        </button>
      </div>

      {appointments.length === 0 ? (
        <div className="text-center py-6">
          <Clock className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500">No hay citas recientes</p>
        </div>
      ) : (
        <div className="space-y-4">
          {appointments.map((appointment) => (
            <div key={appointment.id} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
              <div className="flex-shrink-0">
                {getStatusIcon(appointment.status)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {appointment.patients.first_name} {appointment.patients.last_name}
                  </p>
                  <span className={`text-xs font-medium ${getStatusColor(appointment.status)}`}>
                    {getStatusText(appointment.status)}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  {format(parseISO(appointment.appointment_date), 'dd MMM yyyy', { locale: es })} a las {appointment.appointment_time}
                </p>
                <p className="text-sm text-gray-500 mt-1 truncate">
                  {appointment.reason}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

