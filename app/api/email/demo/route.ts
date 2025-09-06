import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { patientEmail, patientName } = body

    if (!patientEmail || !patientName) {
      return NextResponse.json({ 
        error: 'Se requieren patientEmail y patientName' 
      }, { status: 400 })
    }

    // Simular envío de correo (modo demo)
    console.log('📧 [DEMO] Enviando correo de confirmación a:', patientEmail)
    console.log('📧 [DEMO] Datos del correo:')
    console.log('  - Paciente:', patientName)
    console.log('  - Doctor: Dr. Carlos García')
    console.log('  - Especialidad: Cardiología')
    console.log('  - Fecha: 2024-01-15')
    console.log('  - Hora: 10:00')
    console.log('  - Motivo: Consulta de Cardiología')

    // Simular delay de envío
    await new Promise(resolve => setTimeout(resolve, 1000))

    return NextResponse.json({ 
      success: true, 
      message: 'Correo de confirmación enviado exitosamente (modo demo)',
      demo: true,
      emailData: {
        patientName,
        patientEmail,
        doctorName: 'Dr. Carlos García',
        doctorSpecialty: 'Cardiología',
        appointmentDate: '2024-01-15',
        appointmentTime: '10:00',
        appointmentTitle: 'Consulta de Cardiología',
        appointmentDescription: 'Revisión general del corazón y sistema cardiovascular'
      }
    })
  } catch (error: any) {
    console.error('Error en demo de correo:', error)
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 })
  }
}


