import { NextRequest, NextResponse } from 'next/server'
import { getPool } from '@/lib/database/mysql'

export async function POST(request: NextRequest) {
  try {
    const { patientId, doctorId, appointmentId, historyData } = await request.json()

    if (!patientId || !doctorId || !historyData) {
      return NextResponse.json(
        { error: 'Datos requeridos: patientId, doctorId, historyData' },
        { status: 400 }
      )
    }

    // Crear la historia clínica
    const pool = getPool()
    
    // Si doctorId es un email, buscar el UUID del doctor
    let actualDoctorId = doctorId
    if (doctorId && doctorId.includes('@')) {
      const [doctors] = await pool.execute(
        'SELECT id FROM doctors WHERE email = ?',
        [doctorId]
      )
      if (Array.isArray(doctors) && doctors.length > 0) {
        actualDoctorId = (doctors[0] as any).id
      } else {
        return NextResponse.json(
          { error: 'Doctor no encontrado' },
          { status: 404 }
        )
      }
    }
    
    const query = `
      INSERT INTO clinical_history (
        id,
        patient_id,
        doctor_id,
        appointment_id,
        chief_complaint,
        current_illness,
        medical_history,
        surgical_history,
        allergies,
        medications,
        vital_signs,
        cardiovascular_exam,
        respiratory_exam,
        neurological_exam,
        gastrointestinal_exam,
        genitourinary_exam,
        musculoskeletal_exam,
        dermatological_exam,
        diagnosis,
        treatment,
        recommendations,
        follow_up,
        created_at,
        updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `

    const historyId = `hist_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    const values = [
      historyId,
      patientId,
      actualDoctorId,
      appointmentId || null,
      historyData.chiefComplaint || '',
      historyData.currentIllness || '',
      historyData.medicalHistory || '',
      historyData.surgicalHistory || '',
      historyData.allergies || '',
      historyData.medications || '',
      JSON.stringify(historyData.vitalSigns || {}),
      historyData.cardiovascular || '',
      historyData.respiratory || '',
      historyData.neurological || '',
      historyData.gastrointestinal || '',
      historyData.genitourinary || '',
      historyData.musculoskeletal || '',
      historyData.dermatological || '',
      historyData.diagnosis || '',
      historyData.treatment || '',
      historyData.recommendations || '',
      historyData.followUp || ''
    ]

    await pool.execute(query, values)

    return NextResponse.json({
      success: true,
      message: 'Historia clínica creada correctamente',
      historyId
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

    let query = `
      SELECT 
        ch.*,
        p.first_name,
        p.last_name,
        p.phone,
        p.email,
        d.full_name as doctor_name,
        d.specialty
      FROM clinical_history ch
      LEFT JOIN patients p ON ch.patient_id = p.id
      LEFT JOIN doctors d ON ch.doctor_id = d.id
    `
    
    const conditions = []
    const values = []

    if (patientId) {
      conditions.push('ch.patient_id = ?')
      values.push(patientId)
    }

    if (doctorId) {
      // Si es un email, buscar por email del doctor
      if (doctorId.includes('@')) {
        conditions.push('d.email = ?')
        values.push(doctorId)
      } else {
        conditions.push('ch.doctor_id = ?')
        values.push(doctorId)
      }
    }

    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(' AND ')}`
    }

    query += ' ORDER BY ch.created_at DESC'

    const pool = getPool()
    const [histories] = await pool.execute(query, values)

    // Parsear JSON fields
    const parsedHistories = histories.map((history: any) => ({
      ...history,
      vital_signs: history.vital_signs ? JSON.parse(history.vital_signs) : {}
    }))

    return NextResponse.json(parsedHistories)

  } catch (error: any) {
    console.error('Error fetching clinical histories:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
