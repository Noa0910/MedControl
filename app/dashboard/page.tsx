'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/components/providers/AuthProvider'
import DashboardStats from '@/components/dashboard/DashboardStats'
import RecentAppointments from '@/components/dashboard/RecentAppointments'
import UpcomingAppointments from '@/components/dashboard/UpcomingAppointments'
import AppointmentAlerts from '@/components/dashboard/AppointmentAlerts'
import { apiClient } from '@/lib/api-client'

export default function DashboardPage() {
  const { user, loading } = useAuth()
  const [mounted, setMounted] = useState(false)
  const [stats, setStats] = useState({
    totalPatients: 0,
    totalAppointments: 0,
    todayAppointments: 0,
    pendingAppointments: 0
  })

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const loadStats = async () => {
      if (user?.id) {
        try {
          const [patients, appointments] = await Promise.all([
            apiClient.getPatients(user.id),
            apiClient.getAppointments(user.id)
          ])
          
          const today = new Date().toISOString().split('T')[0]
          
          setStats({
            totalPatients: patients.length,
            totalAppointments: appointments.length,
            todayAppointments: appointments.filter(apt => apt.appointment_date === today).length,
            pendingAppointments: appointments.filter(apt => ['scheduled', 'confirmed'].includes(apt.status)).length
          })
        } catch (error) {
          console.error('Error loading stats:', error)
        }
      }
    }
    
    loadStats()
  }, [user])

  if (!mounted || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Acceso Denegado</h1>
          <p className="text-gray-600">Debes iniciar sesión para acceder al dashboard.</p>
        </div>
      </div>
    )
  }

  // Debug info - temporal
  console.log('🔍 Debug Dashboard - Usuario actual:', user)
  console.log('🔍 Debug Dashboard - Rol:', user.role)
  console.log('🔍 Debug Dashboard - Es admin?', user.role === 'admin')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Bienvenido, {user.full_name}
        </h1>
        <p className="text-gray-600">
          {user.specialty} - Aquí tienes un resumen de tu práctica médica.
        </p>
        {user.role === 'admin' && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Panel de Administración
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>Como administrador, tienes acceso completo al sistema de gestión médica.</p>
                  <p className="mt-1">Usa el menú de <strong>Administración</strong> para gestionar usuarios y configuraciones.</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Panel de Alertas de Citas */}
      <AppointmentAlerts />

      <DashboardStats
        totalPatients={stats.totalPatients}
        totalAppointments={stats.totalAppointments}
        todayAppointments={stats.todayAppointments}
        pendingAppointments={stats.pendingAppointments}
      />

      {user.role === 'admin' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Acciones Rápidas de Administración</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <a
              href="/admin"
              className="flex items-center p-4 bg-red-50 hover:bg-red-100 rounded-lg border border-red-200 transition-colors"
            >
              <div className="flex-shrink-0">
                <svg className="h-8 w-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-red-900">Gestionar Usuarios</h3>
                <p className="text-sm text-red-700">Crear y administrar doctores</p>
              </div>
            </a>
            
            <a
              href="/configuracion"
              className="flex items-center p-4 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors"
            >
              <div className="flex-shrink-0">
                <svg className="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0l1.403 5.777c.1.412-.041.844-.37 1.1l-4.5 3.5a1 1 0 01-1.616-.9l.5-5.5a1 1 0 01.37-1.1l4.5-3.5z" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-blue-900">Configuración</h3>
                <p className="text-sm text-blue-700">Ajustes del sistema</p>
              </div>
            </a>
            
            <a
              href="/dashboard"
              className="flex items-center p-4 bg-green-50 hover:bg-green-100 rounded-lg border border-green-200 transition-colors"
            >
              <div className="flex-shrink-0">
                <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-green-900">Estadísticas</h3>
                <p className="text-sm text-green-700">Ver reportes del sistema</p>
              </div>
            </a>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <UpcomingAppointments />
        <RecentAppointments />
      </div>
    </div>
  )
}