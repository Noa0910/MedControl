import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/database/server-adapter'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { isRead } = await request.json()
    const notificationId = params.id

    if (typeof isRead !== 'boolean') {
      return NextResponse.json(
        { error: 'isRead debe ser un booleano' },
        { status: 400 }
      )
    }

    const query = `
      UPDATE notifications 
      SET is_read = ?
      WHERE id = ?
    `

    const result = await db.query(query, [isRead, notificationId])

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { error: 'Notificación no encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Notificación actualizada correctamente'
    })

  } catch (error: any) {
    console.error('Error updating notification:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const notificationId = params.id

    const query = 'DELETE FROM notifications WHERE id = ?'
    const result = await db.query(query, [notificationId])

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { error: 'Notificación no encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Notificación eliminada correctamente'
    })

  } catch (error: any) {
    console.error('Error deleting notification:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}


