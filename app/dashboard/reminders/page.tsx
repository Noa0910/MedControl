import RemindersList from '@/components/reminders/RemindersList'
import CreateReminderButton from '@/components/reminders/CreateReminderButton'

export default function RemindersPage() {
  // Los datos se cargarán en el componente RemindersList

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Sistema de Recordatorios</h1>
          <p className="text-gray-600 mt-2">
            Gestiona los recordatorios de citas para tus pacientes
          </p>
        </div>
        <CreateReminderButton />
      </div>

      <RemindersList />
    </div>
  )
}

