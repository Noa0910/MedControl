import { NextRequest, NextResponse } from 'next/server'
import { serverDb } from '@/lib/database/server-adapter'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { doctor_id, email, password } = body
    
    if (!doctor_id || !email || !password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    await serverDb.createCredentials({
      doctor_id,
      email,
      password
    })
    
    return NextResponse.json({ message: 'Credentials created successfully' }, { status: 201 })
  } catch (error) {
    console.error('Error creating credentials:', error)
    return NextResponse.json({ error: 'Failed to create credentials' }, { status: 500 })
  }
}
