import { NextRequest, NextResponse } from 'next/server'
import { serverDb } from '@/lib/database/server-adapter'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const doctorId = searchParams.get('doctorId')
    
    const reminders = await serverDb.getReminders(doctorId || undefined)
    return NextResponse.json(reminders)
  } catch (error) {
    console.error('Error fetching reminders:', error)
    return NextResponse.json({ error: 'Failed to fetch reminders' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const reminder = await serverDb.createReminder(body)
    return NextResponse.json(reminder)
  } catch (error) {
    console.error('Error creating reminder:', error)
    return NextResponse.json({ error: 'Failed to create reminder' }, { status: 500 })
  }
}
