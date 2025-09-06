import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/database/server-adapter'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const userType = searchParams.get('userType')

    if (!userId || !userType) {
      return NextResponse.json(
        { error: 'userId y userType son requeridos' },
        { status: 400 }
      )
    }

    const query = `
      SELECT * FROM notifications 
      WHERE user_id = ? AND user_type = ?
      ORDER BY created_at DESC
      LIMIT 50
    `

    const notifications = await db.query(query, [userId, userType])

    return NextResponse.json(notifications)

  } catch (error: any) {
    console.error('Error fetching notifications:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, userType, title, message, type = 'info', appointmentId } = await request.json()

    if (!userId || !userType || !title || !message) {
      return NextResponse.json(
        { error: 'userId, userType, title y message son requeridos' },
        { status: 400 }
      )
    }

    const notificationId = `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    const query = `
      INSERT INTO notifications (id, user_id, user_type, title, message, type, appointment_id)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `

    await db.query(query, [notificationId, userId, userType, title, message, type, appointmentId || null])

    return NextResponse.json({
      success: true,
      message: 'Notificación creada correctamente',
      notificationId
    })

  } catch (error: any) {
    console.error('Error creating notification:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}


