import { NextRequest, NextResponse } from 'next/server'
import { serverDb } from '@/lib/database/server-adapter'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { patient_id, email, password } = body
    
    if (!patient_id || !email || !password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    await serverDb.createPatientCredentials({
      patient_id,
      email,
      password
    })
    
    return NextResponse.json({ message: 'Patient credentials created successfully' }, { status: 201 })
  } catch (error: any) {
    console.error('Error creating patient credentials:', error)
    
    // Handle duplicate email error
    if (error.code === 'ER_DUP_ENTRY' && error.sqlMessage?.includes('email')) {
      return NextResponse.json({ 
        error: 'El email ya está registrado. Por favor usa un email diferente.' 
      }, { status: 409 })
    }
    
    return NextResponse.json({ error: 'Failed to create patient credentials' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')
    const password = searchParams.get('password')
    
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }

    const credentials = await serverDb.getPatientCredentialsByEmail(email)
    
    if (!credentials || credentials.password_hash !== password) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    // Get patient data
    const patient = await serverDb.getPatientById(credentials.patient_id)
    
    if (!patient) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 })
    }

    return NextResponse.json({ 
      success: true, 
      patient: {
        id: patient.id,
        first_name: patient.first_name,
        last_name: patient.last_name,
        email: patient.email,
        phone: patient.phone
      }
    })
  } catch (error) {
    console.error('Error authenticating patient:', error)
    return NextResponse.json({ error: 'Failed to authenticate patient' }, { status: 500 })
  }
}


