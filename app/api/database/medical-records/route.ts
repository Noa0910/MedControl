import { NextRequest, NextResponse } from 'next/server'
import { serverDb } from '@/lib/database/server-adapter'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const doctorId = searchParams.get('doctorId')
    
    const records = await serverDb.getMedicalRecords(doctorId || undefined)
    return NextResponse.json(records)
  } catch (error) {
    console.error('Error fetching medical records:', error)
    return NextResponse.json({ error: 'Failed to fetch medical records' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const record = await serverDb.createMedicalRecord(body)
    return NextResponse.json(record)
  } catch (error) {
    console.error('Error creating medical record:', error)
    return NextResponse.json({ error: 'Failed to create medical record' }, { status: 500 })
  }
}
