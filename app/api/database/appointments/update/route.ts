import { NextRequest, NextResponse } from 'next/server'
import { getPool } from '@/lib/database/mysql'

export async function PUT(request: NextRequest) {
  try {
    console.log('🔄 API de actualización de citas llamada')
    const { appointmentId, updates } = await request.json()
    console.log('📋 Datos recibidos:', { appointmentId, updates })

    if (!appointmentId) {
      return NextResponse.json(
        { error: 'ID de cita requerido' },
        { status: 400 }
      )
    }

    // Construir la consulta de actualización dinámicamente
    const updateFields = []
    const values = []

    if (updates.status) {
      updateFields.push('status = ?')
      values.push(updates.status)
    }

    if (updates.appointment_date) {
      updateFields.push('appointment_date = ?')
      values.push(updates.appointment_date)
    }

    if (updates.appointment_time) {
      updateFields.push('appointment_time = ?')
      values.push(updates.appointment_time)
    }

    if (updates.no_show_reason) {
      updateFields.push('no_show_reason = ?')
      values.push(updates.no_show_reason)
    }

    if (updates.clinical_history) {
      updateFields.push('clinical_history = ?')
      values.push(JSON.stringify(updates.clinical_history))
    }

    if (updates.notes) {
      updateFields.push('notes = ?')
      values.push(updates.notes)
    }

    // Siempre actualizar updated_at
    updateFields.push('updated_at = NOW()')
    values.push(appointmentId)

    if (updateFields.length === 1) { // Solo updated_at
      return NextResponse.json(
        { error: 'No hay campos para actualizar' },
        { status: 400 }
      )
    }

    console.log('🔧 Campos a actualizar:', updateFields)
    console.log('📊 Valores:', values)

    const pool = getPool()
    const query = `
      UPDATE appointments 
      SET ${updateFields.join(', ')}
      WHERE id = ?
    `

    console.log('📝 Query SQL:', query)

    const [result] = await pool.execute(query, values)
    console.log('✅ Resultado de la actualización:', result)

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { error: 'Cita no encontrada' },
        { status: 404 }
      )
    }

    // Si se está atendiendo la cita, actualizar también el paciente
    if (updates.status === 'completed' && updates.patientData) {
      console.log('👤 Actualizando datos del paciente...')
      await updatePatientData(updates.patientData, appointmentId)
    }

    return NextResponse.json({
      success: true,
      message: 'Cita actualizada correctamente',
      appointmentId
    })

  } catch (error: any) {
    console.error('❌ Error updating appointment:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor: ' + error.message },
      { status: 500 }
    )
  }
}

async function updatePatientData(patientData: any, appointmentId: string) {
  try {
    const pool = getPool()
    // Primero obtener el patient_id de la cita
    const appointmentQuery = 'SELECT patient_id FROM appointments WHERE id = ?'
    const [appointmentResult] = await pool.execute(appointmentQuery, [appointmentId])
    
    if (appointmentResult.length === 0) {
      throw new Error('Cita no encontrada')
    }

    const patientId = appointmentResult[0].patient_id

    // Actualizar datos del paciente
    const updateFields = []
    const values = []

    if (patientData.first_name) {
      updateFields.push('first_name = ?')
      values.push(patientData.first_name)
    }

    if (patientData.last_name) {
      updateFields.push('last_name = ?')
      values.push(patientData.last_name)
    }

    if (patientData.phone) {
      updateFields.push('phone = ?')
      values.push(patientData.phone)
    }

    if (patientData.email) {
      updateFields.push('email = ?')
      values.push(patientData.email)
    }

    if (patientData.date_of_birth) {
      updateFields.push('date_of_birth = ?')
      values.push(patientData.date_of_birth)
    }

    if (patientData.gender) {
      updateFields.push('gender = ?')
      values.push(patientData.gender)
    }

    if (patientData.address) {
      updateFields.push('address = ?')
      values.push(patientData.address)
    }

    if (updateFields.length > 0) {
      updateFields.push('updated_at = NOW()')
      values.push(patientId)

      const patientQuery = `
        UPDATE patients 
        SET ${updateFields.join(', ')}
        WHERE id = ?
      `

      await pool.execute(patientQuery, values)
    }

  } catch (error) {
    console.error('Error updating patient data:', error)
    // No lanzar error aquí para no interrumpir la actualización de la cita
  }
}