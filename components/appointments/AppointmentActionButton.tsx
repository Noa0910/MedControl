'use client'

import { useState } from 'react'
import { MoreVertical, Clock, CheckCircle, RotateCcw, AlertCircle } from 'lucide-react'
import AppointmentActionModal from './AppointmentActionModal'

interface Patient {
  first_name: string
  last_name: string
  phone?: string
  email?: string
  date_of_birth?: string
  gender?: string
  address?: string
}

interface Appointment {
  id: string
  appointment_date: string
  appointment_time: string
  duration: number
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show'
  title: string
  description?: string
  patients: Patient
}

interface AppointmentActionButtonProps {
  appointment: Appointment
  onUpdate: (appointmentId: string, updates: any) => void
  compact?: boolean
}

export default function AppointmentActionButton({ 
  appointment, 
  onUpdate, 
  compact = false 
}: AppointmentActionButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)

  const handleAction = (action: 'attend' | 'reschedule' | 'no_show') => {
    setShowDropdown(false)
    setIsModalOpen(true)
  }

  const handleUpdate = async (appointmentId: string, updates: any) => {
    try {
      await onUpdate(appointmentId, updates)
      setIsModalOpen(false)
    } catch (error) {
      console.error('Error updating appointment:', error)
    }
  }

  // No mostrar acciones para citas completadas o canceladas
  if (appointment.status === 'completed' || appointment.status === 'cancelled') {
    return null
  }

  if (compact) {
    return (
      <>
        <button
          onClick={() => setIsModalOpen(true)}
          className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
          title="Gestionar cita"
        >
          <MoreVertical className="w-4 h-4" />
        </button>
        
        <AppointmentActionModal
          appointment={appointment}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onUpdate={handleUpdate}
        />
      </>
    )
  }

  return (
    <>
      <div className="relative">
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          title="Gestionar cita"
        >
          <MoreVertical className="w-5 h-5" />
        </button>

        {showDropdown && (
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
            <div className="py-1">
              <button
                onClick={() => handleAction('attend')}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700"
              >
                <CheckCircle className="w-4 h-4 mr-3 text-green-600" />
                Atender
              </button>
              <button
                onClick={() => handleAction('reschedule')}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700"
              >
                <RotateCcw className="w-4 h-4 mr-3 text-blue-600" />
                Reprogramar
              </button>
              <button
                onClick={() => handleAction('no_show')}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-700"
              >
                <AlertCircle className="w-4 h-4 mr-3 text-red-600" />
                No Asistió
              </button>
            </div>
          </div>
        )}
      </div>

      <AppointmentActionModal
        appointment={appointment}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onUpdate={handleUpdate}
      />
    </>
  )
}


