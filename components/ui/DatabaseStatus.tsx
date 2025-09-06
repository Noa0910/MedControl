'use client'

import { useState, useEffect } from 'react'

export default function DatabaseStatus() {
  const [status, setStatus] = useState<'checking' | 'mysql' | 'localStorage'>('checking')

  useEffect(() => {
    const checkDatabaseStatus = async () => {
      try {
        // Try to connect to MySQL API endpoint
        const response = await fetch('/api/health')
        if (response.ok) {
          setStatus('mysql')
        } else {
          setStatus('localStorage')
        }
      } catch (error) {
        // If API is not available, use localStorage
        setStatus('localStorage')
      }
    }

    checkDatabaseStatus()
  }, [])

  if (status === 'checking') {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
                        <div className={`px-3 py-2 rounded-full text-xs font-medium flex items-center gap-2 ${
                    status === 'mysql'
                      ? 'bg-green-100 text-green-800 border border-green-200'
                      : 'bg-orange-100 text-orange-800 border border-orange-200'
                  }`}>
                    <div className={`w-2 h-2 rounded-full ${
                      status === 'mysql' ? 'bg-green-500' : 'bg-orange-500'
                    }`} />
                    <span>
                      {status === 'mysql' ? 'MySQL' : 'Modo Offline'}
                    </span>
                  </div>
    </div>
  )
}