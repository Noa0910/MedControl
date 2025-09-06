'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import CreateReminderModal from './CreateReminderModal'

export default function CreateReminderButton() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="btn-primary flex items-center space-x-2"
      >
        <Plus className="w-4 h-4" />
        <span>Nuevo Recordatorio</span>
      </button>

      <CreateReminderModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </>
  )
}





