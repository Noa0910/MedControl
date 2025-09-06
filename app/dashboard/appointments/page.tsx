import CalendarView from '@/components/appointments/CalendarView'
import CreateAppointmentButton from '@/components/appointments/CreateAppointmentButton'

export default function AppointmentsPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Calendario de Citas</h1>
          <p className="text-gray-600 mt-2">
            Gestiona las citas médicas con vista de calendario
          </p>
        </div>
        <CreateAppointmentButton />
      </div>

      <CalendarView />
    </div>
  )
}

