import nodemailer from 'nodemailer'

// Configuración del transporter de correo
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false, // true para 465, false para otros puertos
    auth: {
      user: process.env.SMTP_USER || 'tu-email@gmail.com',
      pass: process.env.SMTP_PASS || 'tu-password-de-aplicacion'
    }
  })
}

// Interfaz para datos de la cita
interface AppointmentEmailData {
  patientName: string
  patientEmail: string
  doctorName: string
  doctorSpecialty: string
  appointmentDate: string
  appointmentTime: string
  appointmentTitle: string
  appointmentDescription?: string
  clinicName?: string
  clinicAddress?: string
  clinicPhone?: string
}

// Función para enviar correo de confirmación de cita
export async function sendAppointmentConfirmation(data: AppointmentEmailData) {
  try {
    console.log('📧 Iniciando envío de correo de confirmación...')
    console.log('📧 Datos del correo:', {
      patientEmail: data.patientEmail,
      patientName: data.patientName,
      doctorName: data.doctorName,
      appointmentDate: data.appointmentDate,
      appointmentTime: data.appointmentTime
    })

    // Verificar si las credenciales están configuradas
    const hasValidCredentials = process.env.SMTP_USER && 
                               process.env.SMTP_USER !== 'tu-email@gmail.com' &&
                               process.env.SMTP_PASS && 
                               process.env.SMTP_PASS !== 'tu-password-de-aplicacion'

    if (!hasValidCredentials) {
      console.log('⚠️ Credenciales de correo no configuradas, usando modo demo')
      console.log('📧 [DEMO] Correo de confirmación simulado:')
      console.log('📧 [DEMO] Para:', data.patientEmail)
      console.log('📧 [DEMO] Asunto: Confirmación de Cita Médica -', data.appointmentDate)
      console.log('📧 [DEMO] Doctor:', data.doctorName)
      console.log('📧 [DEMO] Fecha:', data.appointmentDate)
      console.log('📧 [DEMO] Hora:', data.appointmentTime)
      
      return { 
        success: true, 
        messageId: 'demo-' + Date.now(),
        demo: true,
        message: 'Correo simulado (credenciales no configuradas)'
      }
    }

    const transporter = createTransporter()
    
    // Formatear fecha y hora
    const appointmentDate = new Date(data.appointmentDate).toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
    
    const appointmentTime = new Date(`2000-01-01T${data.appointmentTime}`).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    })

    const mailOptions = {
      from: `"MedControl" <${process.env.SMTP_USER || 'noreply@medcontrol.com'}>`,
      to: data.patientEmail,
      subject: `Confirmación de Cita Médica - ${data.appointmentDate}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Confirmación de Cita Médica</title>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #f4f4f4;
            }
            .container {
              background-color: white;
              padding: 30px;
              border-radius: 10px;
              box-shadow: 0 0 20px rgba(0,0,0,0.1);
            }
            .header {
              text-align: center;
              border-bottom: 3px solid #3b82f6;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .logo {
              font-size: 28px;
              font-weight: bold;
              color: #3b82f6;
              margin-bottom: 10px;
            }
            .appointment-details {
              background-color: #f8fafc;
              padding: 20px;
              border-radius: 8px;
              margin: 20px 0;
              border-left: 4px solid #3b82f6;
            }
            .detail-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 10px;
              padding: 5px 0;
            }
            .detail-label {
              font-weight: bold;
              color: #4b5563;
            }
            .detail-value {
              color: #1f2937;
            }
            .highlight {
              background-color: #dbeafe;
              padding: 15px;
              border-radius: 6px;
              margin: 20px 0;
              text-align: center;
            }
            .footer {
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #e5e7eb;
              text-align: center;
              color: #6b7280;
              font-size: 14px;
            }
            .button {
              display: inline-block;
              background-color: #3b82f6;
              color: white;
              padding: 12px 24px;
              text-decoration: none;
              border-radius: 6px;
              margin: 20px 0;
            }
            .warning {
              background-color: #fef3c7;
              border: 1px solid #f59e0b;
              color: #92400e;
              padding: 15px;
              border-radius: 6px;
              margin: 20px 0;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">🏥 MedControl</div>
              <h1>Confirmación de Cita Médica</h1>
            </div>
            
            <p>Estimado/a <strong>${data.patientName}</strong>,</p>
            
            <p>Su cita médica ha sido confirmada exitosamente. A continuación encontrará todos los detalles:</p>
            
            <div class="appointment-details">
              <h3 style="margin-top: 0; color: #3b82f6;">📅 Detalles de la Cita</h3>
              <div class="detail-row">
                <span class="detail-label">👨‍⚕️ Doctor:</span>
                <span class="detail-value">${data.doctorName}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">🏥 Especialidad:</span>
                <span class="detail-value">${data.doctorSpecialty}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">📅 Fecha:</span>
                <span class="detail-value">${appointmentDate}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">🕐 Hora:</span>
                <span class="detail-value">${appointmentTime}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">📝 Motivo:</span>
                <span class="detail-value">${data.appointmentTitle}</span>
              </div>
              ${data.appointmentDescription ? `
              <div class="detail-row">
                <span class="detail-label">📄 Descripción:</span>
                <span class="detail-value">${data.appointmentDescription}</span>
              </div>
              ` : ''}
            </div>
            
            <div class="highlight">
              <h3 style="margin-top: 0; color: #1e40af;">✅ Su cita está confirmada</h3>
              <p>Por favor llegue 15 minutos antes de su cita programada.</p>
            </div>
            
            <div class="warning">
              <strong>⚠️ Importante:</strong>
              <ul style="margin: 10px 0; padding-left: 20px;">
                <li>Si necesita cancelar o reprogramar, hágalo con al menos 24 horas de anticipación</li>
                <li>Traiga una identificación válida</li>
                <li>Si es su primera consulta, traiga sus exámenes médicos previos</li>
              </ul>
            </div>
            
            ${data.clinicName ? `
            <div class="appointment-details">
              <h3 style="margin-top: 0; color: #3b82f6;">📍 Información del Consultorio</h3>
              <div class="detail-row">
                <span class="detail-label">🏥 Nombre:</span>
                <span class="detail-value">${data.clinicName}</span>
              </div>
              ${data.clinicAddress ? `
              <div class="detail-row">
                <span class="detail-label">📍 Dirección:</span>
                <span class="detail-value">${data.clinicAddress}</span>
              </div>
              ` : ''}
              ${data.clinicPhone ? `
              <div class="detail-row">
                <span class="detail-label">📞 Teléfono:</span>
                <span class="detail-value">${data.clinicPhone}</span>
              </div>
              ` : ''}
            </div>
            ` : ''}
            
            <div class="footer">
              <p>Este es un correo automático, por favor no responda a este mensaje.</p>
              <p>Si tiene alguna pregunta, contacte directamente con el consultorio.</p>
              <p><strong>MedControl</strong> - Sistema de Gestión Médica</p>
            </div>
          </div>
        </body>
        </html>
      `
    }

    const result = await transporter.sendMail(mailOptions)
    console.log('✅ Correo de confirmación enviado:', result.messageId)
    return { success: true, messageId: result.messageId }
  } catch (error) {
    console.error('❌ Error enviando correo:', error)
    return { success: false, error: error.message }
  }
}

// Función para enviar recordatorio de cita (opcional)
export async function sendAppointmentReminder(data: AppointmentEmailData) {
  try {
    const transporter = createTransporter()
    
    const mailOptions = {
      from: `"MedControl" <${process.env.SMTP_USER || 'noreply@medcontrol.com'}>`,
      to: data.patientEmail,
      subject: `Recordatorio de Cita Médica - Mañana ${data.appointmentDate}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Recordatorio de Cita Médica</title>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #f4f4f4;
            }
            .container {
              background-color: white;
              padding: 30px;
              border-radius: 10px;
              box-shadow: 0 0 20px rgba(0,0,0,0.1);
            }
            .header {
              text-align: center;
              border-bottom: 3px solid #f59e0b;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .logo {
              font-size: 28px;
              font-weight: bold;
              color: #f59e0b;
              margin-bottom: 10px;
            }
            .reminder {
              background-color: #fef3c7;
              border: 2px solid #f59e0b;
              padding: 20px;
              border-radius: 8px;
              margin: 20px 0;
              text-align: center;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">⏰ MedControl</div>
              <h1>Recordatorio de Cita Médica</h1>
            </div>
            
            <p>Estimado/a <strong>${data.patientName}</strong>,</p>
            
            <div class="reminder">
              <h2>🔔 Recordatorio</h2>
              <p>Le recordamos que tiene una cita médica programada para mañana:</p>
              <p><strong>${data.doctorName}</strong> - ${data.doctorSpecialty}</p>
              <p><strong>Fecha:</strong> ${data.appointmentDate}</p>
              <p><strong>Hora:</strong> ${data.appointmentTime}</p>
            </div>
            
            <p>Por favor llegue 15 minutos antes de su cita programada.</p>
            
            <div class="footer">
              <p>Este es un recordatorio automático.</p>
              <p><strong>MedControl</strong> - Sistema de Gestión Médica</p>
            </div>
          </div>
        </body>
        </html>
      `
    }

    const result = await transporter.sendMail(mailOptions)
    console.log('✅ Recordatorio enviado:', result.messageId)
    return { success: true, messageId: result.messageId }
  } catch (error) {
    console.error('❌ Error enviando recordatorio:', error)
    return { success: false, error: error.message }
  }
}
