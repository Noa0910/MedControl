'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import CreatePatientModal from './CreatePatientModal'

export default function CreatePatientButton() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="btn-primary flex items-center space-x-2"
      >
        <Plus className="w-4 h-4" />
        <span>Nuevo Paciente</span>
      </button>

      <CreatePatientModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </>
  )
}





