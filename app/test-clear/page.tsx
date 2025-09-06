'use client'

import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { useRouter } from 'next/navigation'
import { Trash2, ArrowRight } from 'lucide-react'
import toast from 'react-hot-toast'

export default function TestClearPage() {
  const router = useRouter()

  const clearAllAndGo = () => {
    // Limpiar todo el localStorage
    localStorage.clear()
    
    // Mostrar confirmación
    toast.success('localStorage limpiado completamente')
    
    // Redirigir a agendar
    setTimeout(() => {
      router.push('/agendar')
    }, 1000)
  }

  const checkAndGo = () => {
    const patientData = localStorage.getItem('medcontrol_patient')
    const doctorData = localStorage.getItem('medcontrol_user')
    
    console.log('🔍 Estado actual del localStorage:')
    console.log('Paciente:', patientData)
    console.log('Doctor:', doctorData)
    
    if (!patientData && !doctorData) {
      toast.success('✅ No hay datos de autenticación - Redirigiendo a agendar')
      router.push('/agendar')
    } else {
      toast.error('❌ Aún hay datos de autenticación - Limpia primero')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🧹 Test de Limpieza Completa
          </h1>
          <p className="text-gray-600">
            Herramienta para limpiar completamente el localStorage y probar el flujo
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Acciones de Prueba</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Button
                onClick={clearAllAndGo}
                className="w-full"
                variant="destructive"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Limpiar TODO y Ir a Agendar
              </Button>
              
              <Button
                onClick={checkAndGo}
                className="w-full"
                variant="outline"
              >
                <ArrowRight className="w-4 h-4 mr-2" />
                Verificar y Ir a Agendar
              </Button>
            </div>
            
            <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
              <h3 className="font-semibold text-yellow-900 mb-2">📋 Instrucciones:</h3>
              <ol className="text-sm text-yellow-800 space-y-1 list-decimal list-inside">
                <li>Haz clic en "Limpiar TODO y Ir a Agendar"</li>
                <li>Debería redirigirte a la página de agendamiento</li>
                <li>Debería mostrar el prompt de login/registro</li>
                <li>NO debería mostrar el formulario de agendamiento</li>
              </ol>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


