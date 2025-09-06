import PatientsList from '@/components/patients/PatientsList'
import CreatePatientButton from '@/components/patients/CreatePatientButton'

export default function PatientsPage() {
  // Los datos se cargarán en el componente PatientsList

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Pacientes</h1>
          <p className="text-gray-600 mt-2">
            Administra la información de tus pacientes
          </p>
        </div>
        <CreatePatientButton />
      </div>

      <PatientsList />
    </div>
  )
}

