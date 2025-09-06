'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import CreateMedicalRecordModal from './CreateMedicalRecordModal'

export default function CreateMedicalRecordButton() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="btn-primary flex items-center space-x-2"
      >
        <Plus className="w-4 h-4" />
        <span>Nueva Historia Clínica</span>
      </button>

      <CreateMedicalRecordModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </>
  )
}





