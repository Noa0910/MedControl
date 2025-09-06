import { NextRequest, NextResponse } from 'next/server'
import { serverDb } from '@/lib/database/server-adapter'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const doctorId = searchParams.get('doctorId')
    
    const patients = await serverDb.getPatients(doctorId || undefined)
    return NextResponse.json(patients)
  } catch (error) {
    console.error('Error fetching patients:', error)
    return NextResponse.json({ error: 'Failed to fetch patients' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('Creating patient with data:', body)
    const patient = await serverDb.createPatient(body)
    console.log('Patient created successfully:', patient.id)
    return NextResponse.json(patient)
  } catch (error: any) {
    console.error('Error creating patient:', error)
    return NextResponse.json({ 
      error: 'Failed to create patient',
      details: error.message 
    }, { status: 500 })
  }
}
