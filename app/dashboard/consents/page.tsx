import ConsentsList from '@/components/consents/ConsentsList'
import CreateConsentButton from '@/components/consents/CreateConsentButton'

export default function ConsentsPage() {
  // Los datos se cargarán en el componente ConsentsList

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Consentimientos Informados</h1>
          <p className="text-gray-600 mt-2">
            Gestiona los consentimientos informados de tus pacientes
          </p>
        </div>
        <CreateConsentButton />
      </div>

      <ConsentsList />
    </div>
  )
}

