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

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...updates } = body
    
    if (!id) {
      return NextResponse.json({ error: 'Patient ID is required' }, { status: 400 })
    }
    
    console.log('Updating patient with ID:', id, 'updates:', updates)
    const patient = await serverDb.updatePatient(id, updates)
    console.log('Patient updated successfully:', patient.id)
    return NextResponse.json(patient)
  } catch (error: any) {
    console.error('Error updating patient:', error)
    return NextResponse.json({ 
      error: 'Failed to update patient',
      details: error.message 
    }, { status: 500 })
  }
}
