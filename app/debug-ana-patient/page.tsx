'use client'

import { useState, useEffect } from 'react'
import { apiClient } from '@/lib/api-client'

export default function DebugAnaPatientPage() {
  const [patients, setPatients] = useState<any[]>([])
  const [appointments, setAppointments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('🔄 Cargando datos de debug...')
        
        // Obtener todos los pacientes
        const allPatients = await apiClient.getPatients()
        console.log('👥 Todos los pacientes:', allPatients)
        
        // Buscar pacientes con nombre "ana navarro"
        const anaPatients = allPatients.filter(p => 
          p.first_name?.toLowerCase().includes('ana') && 
          p.last_name?.toLowerCase().includes('navarro')
        )
        console.log('👤 Pacientes ana navarro:', anaPatients)
        
        // Obtener citas
        const allAppointments = await apiClient.getAppointments('doc1@gmail.com')
        console.log('📅 Todas las citas:', allAppointments)
        
        // Buscar citas de ana navarro
        const anaAppointments = allAppointments.filter(apt => {
          const patient = allPatients.find(p => p.id === apt.patient_id)
          return patient && 
            patient.first_name?.toLowerCase().includes('ana') && 
            patient.last_name?.toLowerCase().includes('navarro')
        })
        console.log('📅 Citas de ana navarro:', anaAppointments)
        
        setPatients(anaPatients)
        setAppointments(anaAppointments)
        
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return <div className="p-8">Cargando...</div>
  }

  return (
    <div className="p-8 space-y-8">
      <h1 className="text-2xl font-bold">Debug: Paciente Ana Navarro</h1>
      
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Pacientes encontrados:</h2>
        {patients.map((patient, index) => (
          <div key={index} className="bg-gray-100 p-4 rounded-lg">
            <h3 className="font-semibold">Paciente {index + 1}:</h3>
            <pre className="text-sm overflow-auto">
              {JSON.stringify(patient, null, 2)}
            </pre>
          </div>
        ))}
      </div>
      
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Citas encontradas:</h2>
        {appointments.map((appointment, index) => (
          <div key={index} className="bg-blue-100 p-4 rounded-lg">
            <h3 className="font-semibold">Cita {index + 1}:</h3>
            <pre className="text-sm overflow-auto">
              {JSON.stringify(appointment, null, 2)}
            </pre>
          </div>
        ))}
      </div>
    </div>
  )
}
