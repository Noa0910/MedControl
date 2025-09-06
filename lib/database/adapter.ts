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

// Configuración de la base de datos
// En el servidor (API routes), siempre usar MySQL
// En el cliente, usar localStorage como fallback
const USE_MYSQL = typeof window === 'undefined' || process.env.NODE_ENV === 'production'

// Helper para verificar si estamos en el cliente
const isClient = () => typeof window !== 'undefined'

// Funciones para MySQL
const mysqlAdapter = {
  // Doctores
  async getDoctors(): Promise<Doctor[]> {
    const pool = getPool()
    const [rows] = await pool.execute('SELECT * FROM doctors ORDER BY created_at DESC')
    return rows as Doctor[]
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

  // Pacientes
  async getPatients(doctorId?: string): Promise<Patient[]> {
    const pool = getPool()
    if (doctorId) {
      const [rows] = await pool.execute('SELECT * FROM patients WHERE doctor_id = ? ORDER BY created_at DESC', [doctorId])
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
    const pool = getPool()
    const id = uuidv4()
    const now = new Date().toISOString()
    
    await pool.execute(
      'INSERT INTO patients (id, doctor_id, first_name, last_name, email, phone, date_of_birth, gender, address, emergency_contact_name, emergency_contact_phone, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [id, patient.doctor_id, patient.first_name, patient.last_name, patient.email, patient.phone, patient.date_of_birth, patient.gender, patient.address, patient.emergency_contact_name, patient.emergency_contact_phone, now, now]
    )

    return { ...patient, id, created_at: now, updated_at: now }
  },

  async updatePatient(id: string, updates: Partial<Patient>): Promise<Patient | null> {
    const pool = getPool()
    const now = new Date().toISOString()
    
    const fields = Object.keys(updates).filter(key => key !== 'id' && key !== 'created_at' && key !== 'updated_at')
    const values = fields.map(field => updates[field as keyof Patient])
    const setClause = fields.map(field => `${field} = ?`).join(', ')
    
    await pool.execute(
      `UPDATE patients SET ${setClause}, updated_at = ? WHERE id = ?`,
      [...values, now, id]
    )

    return await this.getPatientById(id)
  },

  async deletePatient(id: string): Promise<boolean> {
    const pool = getPool()
    const [result] = await pool.execute('DELETE FROM patients WHERE id = ?', [id])
    return (result as any).affectedRows > 0
  },

  // Citas
  async getAppointments(doctorId?: string): Promise<Appointment[]> {
    const pool = getPool()
    if (doctorId) {
      const [rows] = await pool.execute('SELECT * FROM appointments WHERE doctor_id = ? ORDER BY appointment_date DESC, appointment_time DESC', [doctorId])
      return rows as Appointment[]
    }
    const [rows] = await pool.execute('SELECT * FROM appointments ORDER BY appointment_date DESC, appointment_time DESC')
    return rows as Appointment[]
  },

  async getAppointmentById(id: string): Promise<Appointment | null> {
    const pool = getPool()
    const [rows] = await pool.execute('SELECT * FROM appointments WHERE id = ?', [id])
    const appointments = rows as Appointment[]
    return appointments[0] || null
  },

  async createAppointment(appointment: Omit<Appointment, 'id' | 'created_at' | 'updated_at'>): Promise<Appointment> {
    const pool = getPool()
    const id = uuidv4()
    const now = new Date().toISOString()
    
    await pool.execute(
      'INSERT INTO appointments (id, doctor_id, patient_id, title, description, appointment_date, appointment_time, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [id, appointment.doctor_id, appointment.patient_id, appointment.title, appointment.description, appointment.appointment_date, appointment.appointment_time, appointment.status, now, now]
    )

    return { ...appointment, id, created_at: now, updated_at: now }
  },

  async updateAppointment(id: string, updates: Partial<Appointment>): Promise<Appointment | null> {
    const pool = getPool()
    const now = new Date().toISOString()
    
    const fields = Object.keys(updates).filter(key => key !== 'id' && key !== 'created_at' && key !== 'updated_at')
    const values = fields.map(field => updates[field as keyof Appointment])
    const setClause = fields.map(field => `${field} = ?`).join(', ')
    
    await pool.execute(
      `UPDATE appointments SET ${setClause}, updated_at = ? WHERE id = ?`,
      [...values, now, id]
    )

    return await this.getAppointmentById(id)
  },

  async deleteAppointment(id: string): Promise<boolean> {
    const pool = getPool()
    const [result] = await pool.execute('DELETE FROM appointments WHERE id = ?', [id])
    return (result as any).affectedRows > 0
  },

  // Historias clínicas
  async getMedicalRecords(doctorId?: string): Promise<MedicalRecord[]> {
    const pool = getPool()
    if (doctorId) {
      const [rows] = await pool.execute('SELECT * FROM medical_records WHERE doctor_id = ? ORDER BY record_date DESC', [doctorId])
      return rows as MedicalRecord[]
    }
    const [rows] = await pool.execute('SELECT * FROM medical_records ORDER BY record_date DESC')
    return rows as MedicalRecord[]
  },

  async createMedicalRecord(record: Omit<MedicalRecord, 'id' | 'created_at' | 'updated_at'>): Promise<MedicalRecord> {
    const pool = getPool()
    const id = uuidv4()
    const now = new Date().toISOString()
    
    await pool.execute(
      'INSERT INTO medical_records (id, doctor_id, patient_id, title, diagnosis, treatment, notes, record_date, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [id, record.doctor_id, record.patient_id, record.title, record.diagnosis, record.treatment, record.notes, record.record_date, now, now]
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
  }
}

// Funciones para localStorage (fallback)
const localStorageAdapter = {
  // Doctores
  async getDoctors(): Promise<Doctor[]> {
    if (!isClient()) return []
    const doctors = localStorage.getItem('doctors')
    return doctors ? JSON.parse(doctors) : []
  },

  async getDoctorById(id: string): Promise<Doctor | null> {
    if (!isClient()) return null
    const doctors = await this.getDoctors()
    return doctors.find(d => d.id === id) || null
  },

  async getDoctorByEmail(email: string): Promise<Doctor | null> {
    if (!isClient()) return null
    const doctors = await this.getDoctors()
    return doctors.find(d => d.email === email) || null
  },

  // Pacientes
  async getPatients(doctorId?: string): Promise<Patient[]> {
    if (!isClient()) return []
    const patients = localStorage.getItem('patients')
    const allPatients = patients ? JSON.parse(patients) : []
    return doctorId ? allPatients.filter((p: Patient) => p.doctor_id === doctorId) : allPatients
  },

  async getPatientById(id: string): Promise<Patient | null> {
    if (!isClient()) return null
    const patients = await this.getPatients()
    return patients.find(p => p.id === id) || null
  },

  async createPatient(patient: Omit<Patient, 'id' | 'created_at' | 'updated_at'>): Promise<Patient> {
    if (!isClient()) throw new Error('localStorage not available')
    const patients = await this.getPatients()
    const newPatient: Patient = {
      ...patient,
      id: uuidv4(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    patients.push(newPatient)
    localStorage.setItem('patients', JSON.stringify(patients))
    return newPatient
  },

  async updatePatient(id: string, updates: Partial<Patient>): Promise<Patient | null> {
    if (!isClient()) return null
    const patients = await this.getPatients()
    const index = patients.findIndex(p => p.id === id)
    if (index === -1) return null
    
    patients[index] = { ...patients[index], ...updates, updated_at: new Date().toISOString() }
    localStorage.setItem('patients', JSON.stringify(patients))
    return patients[index]
  },

  async deletePatient(id: string): Promise<boolean> {
    if (!isClient()) return false
    const patients = await this.getPatients()
    const filtered = patients.filter(p => p.id !== id)
    if (filtered.length === patients.length) return false
    
    localStorage.setItem('patients', JSON.stringify(filtered))
    return true
  },

  // Citas
  async getAppointments(doctorId?: string): Promise<Appointment[]> {
    const appointments = localStorage.getItem('appointments')
    const allAppointments = appointments ? JSON.parse(appointments) : []
    return doctorId ? allAppointments.filter((a: Appointment) => a.doctor_id === doctorId) : allAppointments
  },

  async getAppointmentById(id: string): Promise<Appointment | null> {
    const appointments = await this.getAppointments()
    return appointments.find(a => a.id === id) || null
  },

  async createAppointment(appointment: Omit<Appointment, 'id' | 'created_at' | 'updated_at'>): Promise<Appointment> {
    const appointments = await this.getAppointments()
    const newAppointment: Appointment = {
      ...appointment,
      id: uuidv4(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    appointments.push(newAppointment)
    localStorage.setItem('appointments', JSON.stringify(appointments))
    return newAppointment
  },

  async updateAppointment(id: string, updates: Partial<Appointment>): Promise<Appointment | null> {
    const appointments = await this.getAppointments()
    const index = appointments.findIndex(a => a.id === id)
    if (index === -1) return null
    
    appointments[index] = { ...appointments[index], ...updates, updated_at: new Date().toISOString() }
    localStorage.setItem('appointments', JSON.stringify(appointments))
    return appointments[index]
  },

  async deleteAppointment(id: string): Promise<boolean> {
    const appointments = await this.getAppointments()
    const filtered = appointments.filter(a => a.id !== id)
    if (filtered.length === appointments.length) return false
    
    localStorage.setItem('appointments', JSON.stringify(filtered))
    return true
  },

  // Historias clínicas
  async getMedicalRecords(doctorId?: string): Promise<MedicalRecord[]> {
    const records = localStorage.getItem('medical_records')
    const allRecords = records ? JSON.parse(records) : []
    return doctorId ? allRecords.filter((r: MedicalRecord) => r.doctor_id === doctorId) : allRecords
  },

  async createMedicalRecord(record: Omit<MedicalRecord, 'id' | 'created_at' | 'updated_at'>): Promise<MedicalRecord> {
    const records = await this.getMedicalRecords()
    const newRecord: MedicalRecord = {
      ...record,
      id: uuidv4(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    records.push(newRecord)
    localStorage.setItem('medical_records', JSON.stringify(records))
    return newRecord
  },

  // Consentimientos
  async getConsents(doctorId?: string): Promise<Consent[]> {
    const consents = localStorage.getItem('consents')
    const allConsents = consents ? JSON.parse(consents) : []
    return doctorId ? allConsents.filter((c: Consent) => c.doctor_id === doctorId) : allConsents
  },

  async createConsent(consent: Omit<Consent, 'id' | 'created_at' | 'updated_at'>): Promise<Consent> {
    const consents = await this.getConsents()
    const newConsent: Consent = {
      ...consent,
      id: uuidv4(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    consents.push(newConsent)
    localStorage.setItem('consents', JSON.stringify(consents))
    return newConsent
  },

  // Recordatorios
  async getReminders(doctorId?: string): Promise<Reminder[]> {
    const reminders = localStorage.getItem('reminders')
    const allReminders = reminders ? JSON.parse(reminders) : []
    return doctorId ? allReminders.filter((r: Reminder) => r.doctor_id === doctorId) : allReminders
  },

  async createReminder(reminder: Omit<Reminder, 'id' | 'created_at' | 'updated_at'>): Promise<Reminder> {
    const reminders = await this.getReminders()
    const newReminder: Reminder = {
      ...reminder,
      id: uuidv4(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    reminders.push(newReminder)
    localStorage.setItem('reminders', JSON.stringify(reminders))
    return newReminder
  }
}

// Exportar el adaptador apropiado
export const db = USE_MYSQL ? mysqlAdapter : localStorageAdapter

// Función para verificar la conexión a MySQL
export const checkMySQLConnection = async (): Promise<boolean> => {
  try {
    const pool = getPool()
    await pool.execute('SELECT 1')
    return true
  } catch (error) {
    console.warn('⚠️ No se pudo conectar a MySQL, usando localStorage')
    return false
  }
}
