'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  Calendar, 
  Users, 
  FileText, 
  ClipboardCheck, 
  Bell, 
  Settings,
  LogOut,
  Stethoscope,
  Shield
} from 'lucide-react'
import { useAuth } from '@/components/providers/AuthProvider'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Citas', href: '/dashboard/appointments', icon: Calendar },
  { name: 'Pacientes', href: '/dashboard/patients', icon: Users },
  { name: 'Historias Clínicas', href: '/dashboard/historias-clinicas', icon: FileText },
  { name: 'Consentimientos', href: '/dashboard/consents', icon: ClipboardCheck },
  { name: 'Recordatorios', href: '/dashboard/reminders', icon: Bell },
  { name: 'Configuración', href: '/dashboard/settings', icon: Settings },
]

const adminNavigation = [
  { name: 'Administración', href: '/admin', icon: Shield },
]

export default function Sidebar() {
  const pathname = usePathname()
  const { user, signOut } = useAuth()

  return (
    <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
      <div className="flex flex-col flex-grow bg-white border-r border-gray-200 pt-5 pb-4 overflow-y-auto">
        <div className="flex items-center flex-shrink-0 px-4">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <Stethoscope className="w-5 h-5 text-white" />
            </div>
            <span className="ml-2 text-xl font-bold text-gray-900">MedControl</span>
          </div>
        </div>
        
        <div className="mt-5 flex-grow flex flex-col">
          <nav className="flex-1 px-2 space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${
                    isActive
                      ? 'bg-primary-100 text-primary-900'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <item.icon
                    className={`mr-3 flex-shrink-0 h-5 w-5 ${
                      isActive ? 'text-primary-500' : 'text-gray-400 group-hover:text-gray-500'
                    }`}
                  />
                  {item.name}
                </Link>
              )
            })}
            
            {/* Enlaces de administración - solo para administradores */}
            {user?.role === 'admin' && (
              <>
                <div className="border-t border-gray-200 my-2"></div>
                {adminNavigation.map((item) => {
                  const isActive = pathname === item.href
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${
                        isActive
                          ? 'bg-red-100 text-red-900'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <item.icon
                        className={`mr-3 flex-shrink-0 h-5 w-5 ${
                          isActive ? 'text-red-500' : 'text-gray-400 group-hover:text-gray-500'
                        }`}
                      />
                      {item.name}
                    </Link>
                  )
                })}
              </>
            )}
          </nav>
        </div>

        <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-gray-700">
                {user?.full_name?.charAt(0) || 'U'}
              </span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-700">
                {user?.full_name || 'Usuario'}
              </p>
              <p className="text-xs text-gray-500 capitalize">
                {user?.role || 'Usuario'}
              </p>
            </div>
          </div>
          <button
            onClick={signOut}
            className="ml-auto p-2 text-gray-400 hover:text-gray-600"
            title="Cerrar sesión"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}


