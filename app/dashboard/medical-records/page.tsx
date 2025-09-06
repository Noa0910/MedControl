import MedicalRecordsList from '@/components/medical-records/MedicalRecordsList'
import CreateMedicalRecordButton from '@/components/medical-records/CreateMedicalRecordButton'

interface SearchParams {
  patient?: string
}

interface PageProps {
  searchParams: SearchParams
}

export default function MedicalRecordsPage({ searchParams }: PageProps) {
  // Los datos se cargarán en el componente MedicalRecordsList

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Historia Clínica</h1>
          <p className="text-gray-600 mt-2">
            Gestiona las historias clínicas de tus pacientes
          </p>
        </div>
        <CreateMedicalRecordButton />
      </div>

      <MedicalRecordsList 
        selectedPatientId={searchParams.patient}
      />
    </div>
  )
}

