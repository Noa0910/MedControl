'use client'

import { Users, Calendar, Clock, AlertCircle } from 'lucide-react'

interface DashboardStatsProps {
  totalPatients: number
  totalAppointments: number
  todayAppointments: number
  pendingAppointments: number
}

export default function DashboardStats({
  totalPatients,
  totalAppointments,
  todayAppointments,
  pendingAppointments
}: DashboardStatsProps) {
  const stats = [
    {
      name: 'Total Pacientes',
      value: totalPatients,
      icon: Users,
      color: 'bg-blue-500',
      change: '+12%',
      changeType: 'positive'
    },
    {
      name: 'Citas Totales',
      value: totalAppointments,
      icon: Calendar,
      color: 'bg-green-500',
      change: '+8%',
      changeType: 'positive'
    },
    {
      name: 'Citas Hoy',
      value: todayAppointments,
      icon: Clock,
      color: 'bg-yellow-500',
      change: '+2',
      changeType: 'neutral'
    },
    {
      name: 'Pendientes',
      value: pendingAppointments,
      icon: AlertCircle,
      color: 'bg-red-500',
      change: '-3',
      changeType: 'negative'
    }
  ]

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <div key={stat.name} className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className={`w-8 h-8 ${stat.color} rounded-md flex items-center justify-center`}>
                <stat.icon className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  {stat.name}
                </dt>
                <dd className="flex items-baseline">
                  <div className="text-2xl font-semibold text-gray-900">
                    {stat.value}
                  </div>
                  <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                    stat.changeType === 'positive' ? 'text-green-600' :
                    stat.changeType === 'negative' ? 'text-red-600' :
                    'text-gray-500'
                  }`}>
                    {stat.change}
                  </div>
                </dd>
              </dl>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}





