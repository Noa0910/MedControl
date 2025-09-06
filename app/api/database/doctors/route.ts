import { NextRequest, NextResponse } from 'next/server'
import { serverDb } from '@/lib/database/server-adapter'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const minimal = searchParams.get('minimal') === 'true'
    
    if (minimal) {
      // Solo obtener datos básicos para listas desplegables
      const doctors = await serverDb.getDoctorsMinimal()
      return NextResponse.json(doctors)
    } else {
      const doctors = await serverDb.getDoctors()
      return NextResponse.json(doctors)
    }
  } catch (error) {
    console.error('Error fetching doctors:', error)
    return NextResponse.json({ error: 'Failed to fetch doctors' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Check if this is a login request (has email and password)
    if (body.email && body.password) {
      // This is a login attempt
      const doctor = await serverDb.getDoctorByEmail(body.email)
      if (doctor) {
        // Check credentials
        const credentials = await serverDb.getCredentialsByEmail(body.email)
        if (credentials && credentials.password_hash === body.password) {
          return NextResponse.json({ success: true, doctor })
        }
      }
      return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401 })
    } else {
      // This is a doctor creation
      const doctor = await serverDb.createDoctor(body)
      return NextResponse.json(doctor)
    }
  } catch (error: any) {
    console.error('Error in POST /api/database/doctors:', error)
    
    // Handle duplicate email error
    if (error.code === 'ER_DUP_ENTRY' && error.sqlMessage?.includes('email')) {
      return NextResponse.json({ 
        error: 'El email ya está registrado. Por favor usa un email diferente.' 
      }, { status: 409 })
    }
    
    return NextResponse.json({ error: 'Failed to process doctor request' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...updates } = body
    const doctor = await serverDb.updateDoctor(id, updates)
    return NextResponse.json(doctor)
  } catch (error) {
    console.error('Error updating doctor:', error)
    return NextResponse.json({ error: 'Failed to update doctor' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({ error: 'Doctor ID is required' }, { status: 400 })
    }
    
    const success = await serverDb.deleteDoctor(id)
    if (success) {
      return NextResponse.json({ message: 'Doctor deleted successfully' })
    } else {
      return NextResponse.json({ error: 'Doctor not found' }, { status: 404 })
    }
  } catch (error) {
    console.error('Error deleting doctor:', error)
    return NextResponse.json({ error: 'Failed to delete doctor' }, { status: 500 })
  }
}