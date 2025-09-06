import { notFound } from 'next/navigation'
import { mockDoctors } from '@/lib/mock-data'
import PublicAppointmentForm from '@/components/public/PublicAppointmentForm'

interface PageProps {
  params: {
    doctorId: string
  }
}

export default function PublicAppointmentPage({ params }: PageProps) {
  const { doctorId } = params
  
  // Buscar el doctor por ID
  const doctor = mockDoctors.find(d => d.id === doctorId)
  
  if (!doctor) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-medical-50 to-primary-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <div className="bg-primary-600 p-3 rounded-full">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">MedControl</h1>
            <p className="text-xl text-gray-600">Agendar Cita con {doctor.full_name}</p>
            <p className="text-lg text-primary-600 font-medium">{doctor.specialty}</p>
          </div>

          {/* Información del Doctor */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{doctor.full_name}</h2>
                <p className="text-lg text-primary-600 font-medium">{doctor.specialty}</p>
                <p className="text-gray-600">{doctor.email}</p>
                <p className="text-gray-600">{doctor.phone}</p>
              </div>
            </div>
          </div>

          {/* Formulario de Cita */}
          <PublicAppointmentForm doctorId={doctorId} doctorName={doctor.full_name} />
        </div>
      </div>
    </div>
  )
}




