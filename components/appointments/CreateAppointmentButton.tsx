'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import CreateAppointmentModal from './CreateAppointmentModal'

export default function CreateAppointmentButton() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="btn-primary flex items-center space-x-2"
      >
        <Plus className="w-4 h-4" />
        <span>Nueva Cita</span>
      </button>

      <CreateAppointmentModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </>
  )
}





