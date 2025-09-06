import { NextRequest, NextResponse } from 'next/server'
import { serverDb } from '@/lib/database/server-adapter'

export async function POST(request: NextRequest) {
  try {
    const { patientId, doctorId, appointmentId, historyData } = await request.json()

    if (!patientId || !doctorId || !historyData) {
      return NextResponse.json(
        { error: 'Datos requeridos: patientId, doctorId, historyData' },
        { status: 400 }
      )
    }

    // Crear la historia clínica usando el server adapter
    const result = await serverDb.createClinicalHistory({
      patient_id: patientId,
      doctor_id: doctorId,
      appointment_id: appointmentId,
      chief_complaint: historyData.chiefComplaint || '',
      current_illness: historyData.currentIllness || '',
      medical_history: historyData.medicalHistory || '',
      surgical_history: historyData.surgicalHistory || '',
      allergies: historyData.allergies || '',
      medications: historyData.medications || '',
      vital_signs: historyData.vitalSigns || {},
      cardiovascular: historyData.cardiovascular || '',
      respiratory: historyData.respiratory || '',
      neurological: historyData.neurological || '',
      gastrointestinal: historyData.gastrointestinal || '',
      genitourinary: historyData.genitourinary || '',
      musculoskeletal: historyData.musculoskeletal || '',
      dermatological: historyData.dermatological || '',
      diagnosis: historyData.diagnosis || '',
      treatment: historyData.treatment || '',
      recommendations: historyData.recommendations || '',
      follow_up: historyData.followUp || ''
    })

    return NextResponse.json({
      success: true,
      message: 'Historia clínica creada correctamente',
      historyId: result.id
    })

  } catch (error: any) {
    console.error('Error creating clinical history:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const patientId = searchParams.get('patientId')
    const doctorId = searchParams.get('doctorId')

    // Usar el server adapter para obtener las historias clínicas
    const histories = await serverDb.getClinicalHistories(
      patientId || undefined,
      doctorId || undefined
    )

    return NextResponse.json(histories)

  } catch (error: any) {
    console.error('Error fetching clinical histories:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
