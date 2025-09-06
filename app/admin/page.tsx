'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/components/providers/AuthProvider'
import { apiClient, Doctor } from '@/lib/api-client'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Plus, Users, Edit, Trash2, Shield } from 'lucide-react'
import CreateSpecialistModal from '@/components/admin/CreateSpecialistModal'
import EditSpecialistModal from '@/components/admin/EditSpecialistModal'

export default function AdminPage() {
  const { user, loading } = useAuth()
  const [specialists, setSpecialists] = useState<Doctor[]>([])
  const [loadingSpecialists, setLoadingSpecialists] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingSpecialist, setEditingSpecialist] = useState<Doctor | null>(null)

  useEffect(() => {
    loadSpecialists()
  }, [])

  const loadSpecialists = async () => {
    try {
      setLoadingSpecialists(true)
      const doctors = await apiClient.getDoctors()
      setSpecialists(doctors)
    } catch (error) {
      console.error('Error loading specialists:', error)
    } finally {
      setLoadingSpecialists(false)
    }
  }

  const handleCreateSpecialist = async (specialistData: Omit<Doctor, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      await loadSpecialists()
      setShowCreateModal(false)
    } catch (error) {
      console.error('Error creating specialist:', error)
    }
  }

  const handleEditSpecialist = async (id: string, updates: Partial<Doctor>) => {
    try {
      await loadSpecialists()
      setEditingSpecialist(null)
    } catch (error) {
      console.error('Error editing specialist:', error)
    }
  }

  const handleDeleteSpecialist = async (id: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar este especialista?')) {
      try {
        await apiClient.deleteDoctor(id)
        await loadSpecialists()
      } catch (error) {
        console.error('Error deleting specialist:', error)
        alert('Error al eliminar el especialista. Verifica que no tenga datos asociados.')
      }
    }
  }

  if (loading || loadingSpecialists) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!user || user.role !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Acceso Denegado</h1>
          <p className="text-gray-600">Solo los administradores pueden acceder a esta sección.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Administración</h1>
          <p className="text-gray-600">Gestiona especialistas y configuración del sistema</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Nuevo Especialista
        </Button>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Especialistas</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{specialists.length}</div>
            <p className="text-xs text-muted-foreground">
              Especialistas registrados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Activos</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{specialists.filter(s => s.role === 'doctor').length}</div>
            <p className="text-xs text-muted-foreground">
              Especialistas médicos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Administradores</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{specialists.filter(s => s.role === 'admin').length}</div>
            <p className="text-xs text-muted-foreground">
              Administradores del sistema
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Especialistas */}
      <Card>
        <CardHeader>
          <CardTitle>Especialistas Registrados</CardTitle>
          <CardDescription>
            Gestiona los especialistas que tienen acceso al sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {specialists.map((specialist) => (
              <div key={specialist.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-primary-600">
                      {specialist.full_name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-medium">{specialist.full_name}</h3>
                    <p className="text-sm text-gray-500">{specialist.email}</p>
                    <p className="text-sm text-gray-500">{specialist.specialty}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    specialist.role === 'admin' 
                      ? 'bg-red-100 text-red-800' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {specialist.role === 'admin' ? 'Administrador' : 'Especialista'}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingSpecialist(specialist)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  {specialist.role !== 'admin' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteSpecialist(specialist.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Modales */}
      {showCreateModal && (
        <CreateSpecialistModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleCreateSpecialist}
        />
      )}

      {editingSpecialist && (
        <EditSpecialistModal
          specialist={editingSpecialist}
          onClose={() => setEditingSpecialist(null)}
          onSuccess={handleEditSpecialist}
        />
      )}
    </div>
  )
}

