import { NextRequest, NextResponse } from 'next/server'
import { serverDb } from '@/lib/database/server-adapter'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const doctorId = searchParams.get('doctorId')
    
    const consents = await serverDb.getConsents(doctorId || undefined)
    return NextResponse.json(consents)
  } catch (error) {
    console.error('Error fetching consents:', error)
    return NextResponse.json({ error: 'Failed to fetch consents' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const consent = await serverDb.createConsent(body)
    return NextResponse.json(consent)
  } catch (error) {
    console.error('Error creating consent:', error)
    return NextResponse.json({ error: 'Failed to create consent' }, { status: 500 })
  }
}
