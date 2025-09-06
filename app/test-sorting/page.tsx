'use client'

import { useState, useEffect } from 'react'

// Datos de prueba con fechas específicas
const testData = [
  { id: '1', date: '2025-09-17', time: '13:49:00', patient: 'Paciente 1' },
  { id: '2', date: '2025-09-08', time: '13:35:00', patient: 'Paciente 2' },
  { id: '3', date: '2025-09-08', time: '13:11:00', patient: 'Paciente 3' },
  { id: '4', date: '2025-09-20', time: '10:00:00', patient: 'Paciente 4' },
  { id: '5', date: '2025-09-05', time: '15:30:00', patient: 'Paciente 5' }
]

export default function TestSortingPage() {
  const [appointments, setAppointments] = useState(testData)

  // Función de ordenamiento (igual que en AppointmentsList)
  const sortedAppointments = appointments.sort((a, b) => {
    const dateA = new Date(`${a.date}T${a.time}`)
    const dateB = new Date(`${b.date}T${b.time}`)
    const result = dateA.getTime() - dateB.getTime()
    console.log(`🔄 Ordenando: ${a.date} ${a.time} vs ${b.date} ${b.time} = ${result}`)
    return result
  })

  console.log('📅 Citas ordenadas:', sortedAppointments.map(a => `${a.date} ${a.time}`))

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          🧪 Test de Ordenamiento de Citas
        </h1>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Citas Ordenadas (más próximas primero):</h2>
          
          <div className="space-y-3">
            {sortedAppointments.map((appointment, index) => (
              <div key={appointment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <div className="flex items-center space-x-4">
                  <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                  <div>
                    <div className="font-medium">{appointment.patient}</div>
                    <div className="text-sm text-gray-600">
                      {appointment.date} a las {appointment.time}
                    </div>
                  </div>
                </div>
                <div className="text-sm text-gray-500">
                  {new Date(`${appointment.date}T${appointment.time}`).toLocaleString()}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded">
            <h3 className="font-semibold text-blue-900 mb-2">✅ Resultado esperado:</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>1. Paciente 5 - 2025-09-05 15:30:00 (más próximo)</li>
              <li>2. Paciente 3 - 2025-09-08 13:11:00</li>
              <li>3. Paciente 2 - 2025-09-08 13:35:00</li>
              <li>4. Paciente 1 - 2025-09-17 13:49:00</li>
              <li>5. Paciente 4 - 2025-09-20 10:00:00 (más lejano)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}


