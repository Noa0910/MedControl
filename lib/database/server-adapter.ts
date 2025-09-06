import { getPool } from './mysql'
import { v4 as uuidv4 } from 'uuid'

// Tipos de datos
export interface Doctor {
  id: string
  email: string
  full_name: string
  role: 'doctor' | 'admin' | 'nurse'
  specialty?: string
  phone?: string
  created_at: string
  updated_at: string
}

export interface Patient {
  id: string
  doctor_id: string
  first_name: string
  last_name: string
  email?: string
  phone?: string
  date_of_birth?: string
  gender?: 'male' | 'female' | 'other'
  address?: string
  document_type?: string
  document_number?: string
  eps?: string
  marital_status?: string
  occupation?: string
  emergency_contact_name?: string
  emergency_contact_phone?: string
  created_at: string
  updated_at: string
}

export interface Appointment {
  id: string
  doctor_id: string
  patient_id: string
  title: string
  description?: string
  appointment_date: string
  appointment_time: string
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show'
  created_at: string
  updated_at: string
}

export interface MedicalRecord {
  id: string
  doctor_id: string
  patient_id: string
  title: string
  diagnosis?: string
  treatment?: string
  notes?: string
  record_date: string
  created_at: string
  updated_at: string
}

export interface Consent {
  id: string
  doctor_id: string
  patient_id: string
  title: string
  content: string
  consent_type: 'treatment' | 'surgery' | 'privacy' | 'data_processing' | 'other'
  is_signed: boolean
  signed_at?: string
  created_at: string
  updated_at: string
}

export interface Reminder {
  id: string
  doctor_id: string
  patient_id: string
  appointment_id?: string
  title: string
  message: string
  reminder_type: 'appointment' | 'medication' | 'follow_up' | 'other'
  reminder_date: string
  reminder_time: string
  status: 'pending' | 'sent' | 'failed'
  created_at: string
  updated_at: string
}

// Adaptador solo para servidor (API routes) - siempre usa MySQL
export const serverDb = {
  // Doctores
  async getDoctors(): Promise<Doctor[]> {
    const pool = getPool()
    const [rows] = await pool.execute('SELECT * FROM doctors ORDER BY created_at DESC')
    return rows as Doctor[]
  },

  async getDoctorsMinimal(): Promise<{ id: string; full_name: string; specialty: string; phone: string; role: string }[]> {
    const pool = getPool()
    const [rows] = await pool.execute('SELECT id, full_name, specialty, phone, role FROM doctors WHERE role = ? ORDER BY full_name ASC', ['doctor'])
    return rows as { id: string; full_name: string; specialty: string; phone: string; role: string }[]
  },

  async getDoctorById(id: string): Promise<Doctor | null> {
    const pool = getPool()
    const [rows] = await pool.execute('SELECT * FROM doctors WHERE id = ?', [id])
    const doctors = rows as Doctor[]
    return doctors[0] || null
  },

  async getDoctorByEmail(email: string): Promise<Doctor | null> {
    const pool = getPool()
    const [rows] = await pool.execute('SELECT * FROM doctors WHERE email = ?', [email])
    const doctors = rows as Doctor[]
    return doctors[0] || null
  },

  async createDoctor(doctor: Omit<Doctor, 'id' | 'created_at' | 'updated_at'>): Promise<Doctor> {
    const pool = getPool()
    const id = uuidv4()
    const now = new Date().toISOString()
    
    await pool.execute(
      'INSERT INTO doctors (id, email, full_name, role, specialty, phone, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [id, doctor.email, doctor.full_name, doctor.role, doctor.specialty, doctor.phone, now, now]
    )

    return { ...doctor, id, created_at: now, updated_at: now }
  },

  async updateDoctor(id: string, updates: Partial<Doctor>): Promise<Doctor | null> {
    const pool = getPool()
    const now = new Date().toISOString()
    
    const fields = []
    const values = []
    
    if (updates.email) {
      fields.push('email = ?')
      values.push(updates.email)
    }
    if (updates.full_name) {
      fields.push('full_name = ?')
      values.push(updates.full_name)
    }
    if (updates.role) {
      fields.push('role = ?')
      values.push(updates.role)
    }
    if (updates.specialty) {
      fields.push('specialty = ?')
      values.push(updates.specialty)
    }
    if (updates.phone) {
      fields.push('phone = ?')
      values.push(updates.phone)
    }
    
    if (fields.length === 0) {
      return null
    }
    
    fields.push('updated_at = ?')
    values.push(now, id)
    
    await pool.execute(
      `UPDATE doctors SET ${fields.join(', ')} WHERE id = ?`,
      values
    )

    const [rows] = await pool.execute('SELECT * FROM doctors WHERE id = ?', [id])
    const doctors = rows as Doctor[]
    return doctors[0] || null
  },

  async deleteDoctor(id: string): Promise<boolean> {
    const pool = getPool()
    const [result] = await pool.execute('DELETE FROM doctors WHERE id = ? AND role != ?', [id, 'admin'])
    return (result as any).affectedRows > 0
  },

  // Credenciales
  async createCredentials(credentials: { doctor_id: string; email: string; password: string }): Promise<void> {
    const pool = getPool()
    const id = uuidv4()
    const now = new Date().toISOString()
    
    // En producción, aquí deberías hashear la contraseña
    const passwordHash = credentials.password // Por ahora guardamos la contraseña en texto plano
    
    await pool.execute(
      'INSERT INTO credentials (id, doctor_id, email, password_hash, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
      [id, credentials.doctor_id, credentials.email, passwordHash, now, now]
    )
  },

  async getCredentialsByEmail(email: string): Promise<{ doctor_id: string; password_hash: string } | null> {
    const pool = getPool()
    const [rows] = await pool.execute('SELECT doctor_id, password_hash FROM credentials WHERE email = ?', [email])
    const credentials = rows as { doctor_id: string; password_hash: string }[]
    return credentials[0] || null
  },

  // Credenciales de Pacientes
  async createPatientCredentials(credentials: { patient_id: string; email: string; password: string }): Promise<void> {
    const pool = getPool()
    const id = uuidv4()
    const now = new Date().toISOString()
    
    // En producción, aquí deberías hashear la contraseña
    const passwordHash = credentials.password // Por ahora guardamos la contraseña en texto plano
    
    await pool.execute(
      'INSERT INTO patient_credentials (id, patient_id, email, password_hash, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
      [id, credentials.patient_id, credentials.email, passwordHash, now, now]
    )
  },

  async getPatientCredentialsByEmail(email: string): Promise<{ patient_id: string; password_hash: string } | null> {
    const pool = getPool()
    const [rows] = await pool.execute('SELECT patient_id, password_hash FROM patient_credentials WHERE email = ?', [email])
    const credentials = rows as { patient_id: string; password_hash: string }[]
    return credentials[0] || null
  },

  // Pacientes
  async getPatients(doctorId?: string): Promise<Patient[]> {
    const pool = getPool()
    if (doctorId) {
      // Si doctorId es un email, buscar el UUID correspondiente
      let actualDoctorId = doctorId
      if (doctorId.includes('@')) {
        const [doctors] = await pool.execute('SELECT id FROM doctors WHERE email = ?', [doctorId])
      const doctorsArray = doctors as any[]
      if (doctorsArray.length === 0) {
        return []
      }
      actualDoctorId = doctorsArray[0].id
      }
      const [rows] = await pool.execute('SELECT * FROM patients WHERE doctor_id = ? ORDER BY created_at DESC', [actualDoctorId])
      return rows as Patient[]
    }
    const [rows] = await pool.execute('SELECT * FROM patients ORDER BY created_at DESC')
    return rows as Patient[]
  },

  async getPatientById(id: string): Promise<Patient | null> {
    const pool = getPool()
    const [rows] = await pool.execute('SELECT * FROM patients WHERE id = ?', [id])
    const patients = rows as Patient[]
    return patients[0] || null
  },

  async createPatient(patient: Omit<Patient, 'id' | 'created_at' | 'updated_at'>): Promise<Patient> {
    // Usar conexión directa temporalmente para debug
    const mysql = require('mysql2/promise')
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'medcontrol'
    })
    
    // Verificar si ya existe un paciente con el mismo documento
    if (patient.document_type && patient.document_number) {
      const [existingPatients] = await connection.execute(
        'SELECT id, first_name, last_name FROM patients WHERE document_type = ? AND document_number = ?',
        [patient.document_type, patient.document_number]
      )
      
      if (existingPatients.length > 0) {
        await connection.end()
        const existing = existingPatients[0] as any
        throw new Error(`Ya existe un paciente con el documento ${patient.document_type} ${patient.document_number}: ${existing.first_name} ${existing.last_name}`)
      }
    }
    
    const id = uuidv4()
    const now = new Date().toISOString()
    
    // Si doctor_id es un email, buscar el UUID correspondiente
    let doctorId = patient.doctor_id
    if (patient.doctor_id.includes('@')) {
      const [doctors] = await connection.execute('SELECT id FROM doctors WHERE email = ?', [patient.doctor_id])
      if (doctors.length === 0) {
        await connection.end()
        throw new Error('Doctor not found')
      }
      doctorId = (doctors[0] as any).id
    } else if (patient.doctor_id === 'public') {
      // Para pacientes públicos, usar un doctor por defecto o crear uno especial
      // Por ahora, usaremos el primer doctor disponible
      const [doctors] = await connection.execute('SELECT id FROM doctors WHERE role = ? LIMIT 1', ['doctor'])
      if (doctors.length === 0) {
        await connection.end()
        throw new Error('No doctors available for public patients')
      }
      doctorId = (doctors[0] as any).id
    }
    
    await connection.execute(
      'INSERT INTO patients (id, doctor_id, first_name, last_name, email, phone, date_of_birth, gender, address, document_type, document_number, eps, marital_status, occupation, emergency_contact_name, emergency_contact_phone, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        id, 
        doctorId, 
        patient.first_name, 
        patient.last_name, 
        patient.email || null, 
        patient.phone || null, 
        patient.date_of_birth || null, 
        patient.gender || null, 
        patient.address || null, 
        patient.document_type || null,
        patient.document_number || null,
        patient.eps || null,
        patient.marital_status || null,
        patient.occupation || null,
        patient.emergency_contact_name || null, 
        patient.emergency_contact_phone || null, 
        now, 
        now
      ]
    )

    await connection.end()
    return { ...patient, id, created_at: now, updated_at: now }
  },

  async updatePatient(id: string, updates: Partial<Patient>): Promise<Patient> {
    console.log('🔄 updatePatient called with:', { id, updates })
    const pool = getPool()
    const now = new Date().toISOString()
    
    // Construir la consulta UPDATE dinámicamente
    const updateFields = []
    const values = []
    
    if (updates.first_name !== undefined) {
      updateFields.push('first_name = ?')
      values.push(updates.first_name)
    }
    if (updates.last_name !== undefined) {
      updateFields.push('last_name = ?')
      values.push(updates.last_name)
    }
    if (updates.email !== undefined) {
      updateFields.push('email = ?')
      values.push(updates.email)
    }
    if (updates.phone !== undefined) {
      updateFields.push('phone = ?')
      values.push(updates.phone)
    }
    if (updates.date_of_birth !== undefined) {
      updateFields.push('date_of_birth = ?')
      values.push(updates.date_of_birth)
    }
    if (updates.gender !== undefined) {
      updateFields.push('gender = ?')
      values.push(updates.gender)
    }
    if (updates.address !== undefined) {
      updateFields.push('address = ?')
      values.push(updates.address)
    }
    if (updates.document_type !== undefined) {
      updateFields.push('document_type = ?')
      values.push(updates.document_type)
    }
    if (updates.document_number !== undefined) {
      updateFields.push('document_number = ?')
      values.push(updates.document_number)
    }
    if (updates.eps !== undefined) {
      updateFields.push('eps = ?')
      values.push(updates.eps)
    }
    if (updates.marital_status !== undefined) {
      updateFields.push('marital_status = ?')
      values.push(updates.marital_status)
    }
    if (updates.occupation !== undefined) {
      updateFields.push('occupation = ?')
      values.push(updates.occupation)
    }
    if (updates.emergency_contact_name !== undefined) {
      updateFields.push('emergency_contact_name = ?')
      values.push(updates.emergency_contact_name)
    }
    if (updates.emergency_contact_phone !== undefined) {
      updateFields.push('emergency_contact_phone = ?')
      values.push(updates.emergency_contact_phone)
    }
    
    if (updateFields.length === 0) {
      throw new Error('No fields to update')
    }
    
    // Agregar updated_at
    updateFields.push('updated_at = ?')
    values.push(now)
    
    // Agregar el ID al final
    values.push(id)
    
    const query = `UPDATE patients SET ${updateFields.join(', ')} WHERE id = ?`
    console.log('🔄 Executing query:', query)
    console.log('🔄 With values:', values)
    
    await pool.execute(query, values)
    console.log('✅ Update query executed successfully')
    
    // Obtener el paciente actualizado
    const [rows] = await pool.execute('SELECT * FROM patients WHERE id = ?', [id])
    const patients = rows as Patient[]
    console.log('🔄 Retrieved updated patient:', patients[0])
    
    if (patients.length === 0) {
      throw new Error('Patient not found after update')
    }
    
    return patients[0]
  },

  // Citas
  async getAppointments(doctorId?: string): Promise<Appointment[]> {
    const pool = getPool()
    if (doctorId) {
      // Si doctorId es un email, buscar el UUID correspondiente
      let actualDoctorId = doctorId
      if (doctorId.includes('@')) {
        const [doctors] = await pool.execute('SELECT id FROM doctors WHERE email = ?', [doctorId])
      const doctorsArray = doctors as any[]
      if (doctorsArray.length === 0) {
        return []
      }
      actualDoctorId = doctorsArray[0].id
      }
      const [rows] = await pool.execute('SELECT * FROM appointments WHERE doctor_id = ? ORDER BY appointment_date DESC, appointment_time DESC', [actualDoctorId])
      return rows as Appointment[]
    }
    const [rows] = await pool.execute('SELECT * FROM appointments ORDER BY appointment_date DESC, appointment_time DESC')
    return rows as Appointment[]
  },

  async createAppointment(appointment: Omit<Appointment, 'id' | 'created_at' | 'updated_at'>): Promise<Appointment> {
    // Usar conexión directa temporalmente para debug
    const mysql = require('mysql2/promise')
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'medcontrol'
    })
    
    const id = uuidv4()
    const now = new Date().toISOString()
    
    // Si doctor_id es un email, buscar el UUID correspondiente
    let doctorId = appointment.doctor_id
    if (appointment.doctor_id.includes('@')) {
      const [doctors] = await connection.execute('SELECT id FROM doctors WHERE email = ?', [appointment.doctor_id])
      if (doctors.length === 0) {
        await connection.end()
        throw new Error('Doctor not found')
      }
      doctorId = (doctors[0] as any).id
    }
    
    await connection.execute(
      'INSERT INTO appointments (id, doctor_id, patient_id, title, description, appointment_date, appointment_time, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [id, doctorId, appointment.patient_id, appointment.title, appointment.description, appointment.appointment_date, appointment.appointment_time, appointment.status, now, now]
    )

    // Obtener datos del paciente y doctor para el correo
    try {
      console.log('📧 Buscando datos del paciente:', appointment.patient_id)
      const [patientRows] = await connection.execute('SELECT first_name, last_name, email FROM patients WHERE id = ?', [appointment.patient_id])
      console.log('📧 Datos del paciente encontrados:', patientRows)
      
      console.log('📧 Buscando datos del doctor:', doctorId)
      const [doctorRows] = await connection.execute('SELECT full_name, specialty FROM doctors WHERE id = ?', [doctorId])
      console.log('📧 Datos del doctor encontrados:', doctorRows)
      
      if (patientRows.length > 0 && doctorRows.length > 0) {
        const patient = patientRows[0] as any
        const doctor = doctorRows[0] as any
        
        console.log('📧 Preparando datos para correo...')
        console.log('📧 Paciente:', patient)
        console.log('📧 Doctor:', doctor)
        
        // Enviar correo de confirmación
        const { sendAppointmentConfirmation } = await import('@/lib/email/email-service')
        
        const emailData = {
          patientName: `${patient.first_name} ${patient.last_name}`,
          patientEmail: patient.email,
          doctorName: doctor.full_name,
          doctorSpecialty: doctor.specialty || 'Medicina General',
          appointmentDate: appointment.appointment_date,
          appointmentTime: appointment.appointment_time,
          appointmentTitle: appointment.title,
          appointmentDescription: appointment.description,
          clinicName: 'MedControl - Consultorio Principal',
          clinicAddress: 'Calle 123 #45-67, Bogotá, Colombia',
          clinicPhone: '+57 (1) 234-5678'
        }
        
        console.log('📧 Datos del correo preparados:', emailData)
        
        // Enviar correo de forma asíncrona (no bloquear la respuesta)
        sendAppointmentConfirmation(emailData).then(result => {
          console.log('📧 Resultado del envío de correo:', result)
          if (result.success) {
            console.log('✅ Correo de confirmación enviado para cita:', id)
            if (result.demo) {
              console.log('📧 [DEMO] Correo simulado - verifica la consola del servidor para ver los detalles')
            }
          } else {
            console.error('❌ Error enviando correo:', result.error)
          }
        }).catch(error => {
          console.error('❌ Error enviando correo:', error)
        })
      } else {
        console.log('⚠️ No se encontraron datos del paciente o doctor para enviar correo')
        console.log('📧 Paciente encontrado:', patientRows.length > 0)
        console.log('📧 Doctor encontrado:', doctorRows.length > 0)
      }
    } catch (emailError) {
      console.error('❌ Error obteniendo datos para correo:', emailError)
      // No fallar la creación de la cita si hay error con el correo
    }

    await connection.end()
    return { ...appointment, id, created_at: now, updated_at: now }
  },

  // Historias clínicas
  async getMedicalRecords(doctorId?: string): Promise<MedicalRecord[]> {
    const pool = getPool()
    if (doctorId) {
      // Si doctorId es un email, buscar el UUID correspondiente
      let actualDoctorId = doctorId
      if (doctorId.includes('@')) {
        const [doctors] = await pool.execute('SELECT id FROM doctors WHERE email = ?', [doctorId])
      const doctorsArray = doctors as any[]
      if (doctorsArray.length === 0) {
        return []
      }
      actualDoctorId = doctorsArray[0].id
      }
      const [rows] = await pool.execute('SELECT * FROM medical_records WHERE doctor_id = ? ORDER BY record_date DESC', [actualDoctorId])
      return rows as MedicalRecord[]
    }
    const [rows] = await pool.execute('SELECT * FROM medical_records ORDER BY record_date DESC')
    return rows as MedicalRecord[]
  },

  async createMedicalRecord(record: Omit<MedicalRecord, 'id' | 'created_at' | 'updated_at'>): Promise<MedicalRecord> {
    const pool = getPool()
    const id = uuidv4()
    const now = new Date().toISOString()
    
    // Si doctor_id es un email, buscar el UUID correspondiente
    let doctorId = record.doctor_id
    if (record.doctor_id.includes('@')) {
      const [doctors] = await pool.execute('SELECT id FROM doctors WHERE email = ?', [record.doctor_id])
      const doctorsArray = doctors as any[]
      if (doctorsArray.length === 0) {
        throw new Error('Doctor not found')
      }
      doctorId = doctorsArray[0].id
    }
    
    await pool.execute(
      'INSERT INTO medical_records (id, doctor_id, patient_id, title, diagnosis, treatment, notes, record_date, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [id, doctorId, record.patient_id, record.title, record.diagnosis, record.treatment, record.notes, record.record_date, now, now]
    )

    return { ...record, id, created_at: now, updated_at: now }
  },

  // Consentimientos
  async getConsents(doctorId?: string): Promise<Consent[]> {
    const pool = getPool()
    if (doctorId) {
      const [rows] = await pool.execute('SELECT * FROM consents WHERE doctor_id = ? ORDER BY created_at DESC', [doctorId])
      return rows as Consent[]
    }
    const [rows] = await pool.execute('SELECT * FROM consents ORDER BY created_at DESC')
    return rows as Consent[]
  },

  async createConsent(consent: Omit<Consent, 'id' | 'created_at' | 'updated_at'>): Promise<Consent> {
    const pool = getPool()
    const id = uuidv4()
    const now = new Date().toISOString()
    
    await pool.execute(
      'INSERT INTO consents (id, doctor_id, patient_id, title, content, consent_type, is_signed, signed_at, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [id, consent.doctor_id, consent.patient_id, consent.title, consent.content, consent.consent_type, consent.is_signed, consent.signed_at, now, now]
    )

    return { ...consent, id, created_at: now, updated_at: now }
  },

  // Recordatorios
  async getReminders(doctorId?: string): Promise<Reminder[]> {
    const pool = getPool()
    if (doctorId) {
      const [rows] = await pool.execute('SELECT * FROM reminders WHERE doctor_id = ? ORDER BY reminder_date DESC', [doctorId])
      return rows as Reminder[]
    }
    const [rows] = await pool.execute('SELECT * FROM reminders ORDER BY reminder_date DESC')
    return rows as Reminder[]
  },

  async createReminder(reminder: Omit<Reminder, 'id' | 'created_at' | 'updated_at'>): Promise<Reminder> {
    const pool = getPool()
    const id = uuidv4()
    const now = new Date().toISOString()
    
    await pool.execute(
      'INSERT INTO reminders (id, doctor_id, patient_id, appointment_id, title, message, reminder_type, reminder_date, reminder_time, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [id, reminder.doctor_id, reminder.patient_id, reminder.appointment_id, reminder.title, reminder.message, reminder.reminder_type, reminder.reminder_date, reminder.reminder_time, reminder.status, now, now]
    )

    return { ...reminder, id, created_at: now, updated_at: now }
  },

  // Historias Clínicas
  async createClinicalHistory(historyData: {
    patient_id: string
    doctor_id: string
    appointment_id?: string | null
    chief_complaint: string
    current_illness?: string
    medical_history?: string
    surgical_history?: string
    allergies?: string
    medications?: string
    vital_signs?: any
    cardiovascular?: string
    respiratory?: string
    neurological?: string
    gastrointestinal?: string
    genitourinary?: string
    musculoskeletal?: string
    dermatological?: string
    diagnosis?: string
    treatment?: string
    recommendations?: string
    follow_up?: string
  }): Promise<any> {
    const pool = getPool()
    const id = `hist_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const now = new Date().toISOString()
    
    // Si doctor_id es un email, buscar el UUID del doctor
    let actualDoctorId = historyData.doctor_id
    if (historyData.doctor_id && historyData.doctor_id.includes('@')) {
      const [doctors] = await pool.execute(
        'SELECT id FROM doctors WHERE email = ?',
        [historyData.doctor_id]
      )
      if (Array.isArray(doctors) && doctors.length > 0) {
        actualDoctorId = (doctors[0] as any).id
      } else {
        throw new Error('Doctor no encontrado')
      }
    }
    
    const query = `
      INSERT INTO clinical_history (
        id, patient_id, doctor_id, appointment_id, chief_complaint, current_illness,
        medical_history, surgical_history, allergies, medications, vital_signs,
        cardiovascular_exam, respiratory_exam, neurological_exam, gastrointestinal_exam,
        genitourinary_exam, musculoskeletal_exam, dermatological_exam, diagnosis,
        treatment, recommendations, follow_up, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `
    
    const values = [
      id,
      historyData.patient_id,
      actualDoctorId,
      historyData.appointment_id || null,
      historyData.chief_complaint || '',
      historyData.current_illness || '',
      historyData.medical_history || '',
      historyData.surgical_history || '',
      historyData.allergies || '',
      historyData.medications || '',
      JSON.stringify(historyData.vital_signs || {}),
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
      historyData.follow_up || '',
      now,
      now
    ]

    await pool.execute(query, values)

    return { 
      id, 
      patient_id: historyData.patient_id, 
      doctor_id: actualDoctorId, 
      appointment_id: historyData.appointment_id,
      created_at: now, 
      updated_at: now 
    }
  },

  async getClinicalHistories(patientId?: string, doctorId?: string): Promise<any[]> {
    const pool = getPool()
    
    let query = `
      SELECT 
        ch.*,
        p.first_name as patient_first_name,
        p.last_name as patient_last_name,
        p.phone as patient_phone,
        p.email as patient_email,
        d.full_name as doctor_name,
        d.specialty as doctor_specialty,
        a.appointment_date,
        a.appointment_time
      FROM clinical_history ch
      LEFT JOIN patients p ON ch.patient_id = p.id
      LEFT JOIN doctors d ON ch.doctor_id = d.id
      LEFT JOIN appointments a ON ch.appointment_id = a.id
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

    const [histories] = await pool.execute(query, values)

    // Parsear JSON fields
    const historiesArray = histories as any[]
    const parsedHistories = historiesArray.map((history: any) => ({
      ...history,
      vital_signs: history.vital_signs ? JSON.parse(history.vital_signs) : {}
    }))

    return parsedHistories
  }
}

