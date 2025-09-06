import { NextRequest, NextResponse } from 'next/server'
import { sendAppointmentConfirmation } from '@/lib/email/email-service'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { patientEmail, patientName } = body

    if (!patientEmail || !patientName) {
      return NextResponse.json({ 
        error: 'Se requieren patientEmail y patientName' 
      }, { status: 400 })
    }

    // Datos de prueba para el correo
    const emailData = {
      patientName,
      patientEmail,
      doctorName: 'Dr. Carlos García',
      doctorSpecialty: 'Cardiología',
      appointmentDate: '2024-01-15',
      appointmentTime: '10:00',
      appointmentTitle: 'Consulta de Cardiología',
      appointmentDescription: 'Revisión general del corazón y sistema cardiovascular',
      clinicName: 'MedControl - Consultorio Principal',
      clinicAddress: 'Calle 123 #45-67, Bogotá, Colombia',
      clinicPhone: '+57 (1) 234-5678'
    }

    const result = await sendAppointmentConfirmation(emailData)
    
    if (result.success) {
      return NextResponse.json({ 
        success: true, 
        message: 'Correo de prueba enviado exitosamente',
        messageId: result.messageId
      })
    } else {
      return NextResponse.json({ 
        success: false, 
        error: result.error 
      }, { status: 500 })
    }
  } catch (error: any) {
    console.error('Error enviando correo de prueba:', error)
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 })
  }
}


