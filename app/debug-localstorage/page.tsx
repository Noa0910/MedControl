'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { useRouter } from 'next/navigation'
import { Trash2, RefreshCw, ArrowRight } from 'lucide-react'
import toast from 'react-hot-toast'

export default function DebugLocalStoragePage() {
  const router = useRouter()
  const [localStorageData, setLocalStorageData] = useState<{
    patient: string | null
    doctor: string | null
    allKeys: string[]
  }>({
    patient: null,
    doctor: null,
    allKeys: []
  })

  const checkLocalStorage = () => {
    if (typeof window === 'undefined') {
      console.log('⚠️ No estamos en el cliente')
      return
    }

    const patient = localStorage.getItem('medcontrol_patient')
    const doctor = localStorage.getItem('medcontrol_user')
    const allKeys = Object.keys(localStorage)

    console.log('🔍 Estado del localStorage:')
    console.log('Paciente:', patient)
    console.log('Doctor:', doctor)
    console.log('Todas las claves:', allKeys)

    setLocalStorageData({
      patient,
      doctor,
      allKeys
    })
  }

  const clearAll = () => {
    if (typeof window === 'undefined') return
    
    localStorage.clear()
    checkLocalStorage()
    toast.success('localStorage limpiado completamente')
  }

  const goToAgendar = () => {
    router.push('/agendar')
  }

  const simulatePatient = () => {
    if (typeof window === 'undefined') return
    
    const mockPatient = {
      id: 'test-patient-123',
      first_name: 'Juan',
      last_name: 'Pérez',
      email: 'juan.perez@example.com'
    }
    
    localStorage.setItem('medcontrol_patient', JSON.stringify(mockPatient))
    checkLocalStorage()
    toast.success('Paciente simulado agregado')
  }

  // Verificar al cargar y cada segundo
  useEffect(() => {
    checkLocalStorage()
    
    const interval = setInterval(checkLocalStorage, 1000)
    
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🔍 Debug LocalStorage
          </h1>
          <p className="text-gray-600">
            Monitoreo en tiempo real del localStorage
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Estado Actual */}
          <Card>
            <CardHeader>
              <CardTitle>Estado Actual del localStorage</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Paciente:</span>
                  <span className={`px-2 py-1 rounded text-sm ${
                    localStorageData.patient ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {localStorageData.patient ? 'Presente' : 'Ausente'}
                  </span>
                </div>
                {localStorageData.patient && (
                  <div className="text-xs bg-gray-100 p-2 rounded font-mono">
                    {localStorageData.patient}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Doctor:</span>
                  <span className={`px-2 py-1 rounded text-sm ${
                    localStorageData.doctor ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {localStorageData.doctor ? 'Presente' : 'Ausente'}
                  </span>
                </div>
                {localStorageData.doctor && (
                  <div className="text-xs bg-gray-100 p-2 rounded font-mono">
                    {localStorageData.doctor}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <div className="font-medium">Todas las claves:</div>
                <div className="text-xs bg-gray-100 p-2 rounded font-mono">
                  {localStorageData.allKeys.length > 0 ? localStorageData.allKeys.join(', ') : 'Ninguna'}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Acciones */}
          <Card>
            <CardHeader>
              <CardTitle>Acciones de Debug</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Button
                  onClick={checkLocalStorage}
                  className="w-full"
                  variant="outline"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Actualizar Estado
                </Button>
                
                <Button
                  onClick={clearAll}
                  className="w-full"
                  variant="destructive"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Limpiar Todo
                </Button>
                
                <Button
                  onClick={simulatePatient}
                  className="w-full"
                  variant="outline"
                >
                  Simular Paciente
                </Button>
                
                <Button
                  onClick={goToAgendar}
                  className="w-full"
                >
                  <ArrowRight className="w-4 h-4 mr-2" />
                  Ir a Agendar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Instrucciones */}
        <Card>
          <CardHeader>
            <CardTitle>📋 Instrucciones de Prueba</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-red-50 p-4 rounded-lg">
                <h3 className="font-semibold text-red-900 mb-2">❌ Prueba 1: Sin Datos</h3>
                <ol className="text-sm text-red-800 space-y-1 list-decimal list-inside">
                  <li>Haz clic en "Limpiar Todo"</li>
                  <li>Verifica que ambos campos muestren "Ausente"</li>
                  <li>Haz clic en "Ir a Agendar"</li>
                  <li>Debería mostrar el prompt de login/registro</li>
                </ol>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-semibold text-green-900 mb-2">✅ Prueba 2: Con Datos</h3>
                <ol className="text-sm text-green-800 space-y-1 list-decimal list-inside">
                  <li>Haz clic en "Simular Paciente"</li>
                  <li>Verifica que el campo Paciente muestre "Presente"</li>
                  <li>Haz clic en "Ir a Agendar"</li>
                  <li>Debería mostrar el formulario de agendamiento</li>
                </ol>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-2">🔍 Debug</h3>
                <p className="text-sm text-blue-800">
                  Esta página se actualiza automáticamente cada segundo. Abre la consola del navegador (F12) para ver los logs detallados.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


