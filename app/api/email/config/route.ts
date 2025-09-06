import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Debug: Log las variables de entorno
    console.log('🔍 Variables de entorno SMTP:')
    console.log('SMTP_HOST:', process.env.SMTP_HOST)
    console.log('SMTP_PORT:', process.env.SMTP_PORT)
    console.log('SMTP_USER:', process.env.SMTP_USER)
    console.log('SMTP_PASS:', process.env.SMTP_PASS ? '***configurado***' : 'no configurado')

    const config = {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      user: process.env.SMTP_USER || 'tu-email@gmail.com',
      configured: process.env.SMTP_USER && 
                 process.env.SMTP_USER !== 'tu-email@gmail.com' &&
                 process.env.SMTP_PASS && 
                 process.env.SMTP_PASS !== 'tu-password-de-aplicacion'
    }

    console.log('📧 Configuración final:', config)
    return NextResponse.json(config)
  } catch (error) {
    console.error('Error getting SMTP config:', error)
    return NextResponse.json({ error: 'Failed to get SMTP config' }, { status: 500 })
  }
}
