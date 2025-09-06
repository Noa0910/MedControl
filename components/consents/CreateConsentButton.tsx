'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import CreateConsentModal from './CreateConsentModal'

export default function CreateConsentButton() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="btn-primary flex items-center space-x-2"
      >
        <Plus className="w-4 h-4" />
        <span>Nuevo Consentimiento</span>
      </button>

      <CreateConsentModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </>
  )
}





