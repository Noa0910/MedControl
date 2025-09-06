'use client'

import CalendarView from '@/components/appointments/CalendarView'

export default function TestCalendarPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🗓️ Test del Calendario de Citas
          </h1>
          <p className="text-gray-600">
            Prueba del nuevo sistema de calendario con vistas mensual, semanal y diaria
          </p>
        </div>

        <CalendarView />
      </div>
    </div>
  )
}


