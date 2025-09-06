// Cliente de API para comunicarse con las rutas del servidor
const API_BASE = '/api/database'

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

// Funciones de API
export const apiClient = {
  // Doctores
  async getDoctors(): Promise<Doctor[]> {
    const response = await fetch(`${API_BASE}/doctors`)
    if (!response.ok) throw new Error('Failed to fetch doctors')
    return response.json()
  },

  async getDoctorsMinimal(): Promise<{ id: string; full_name: string; specialty: string; phone: string; role: string }[]> {
    const response = await fetch(`${API_BASE}/doctors?minimal=true`)
    if (!response.ok) throw new Error('Failed to fetch doctors')
    return response.json()
  },

  async createDoctor(doctor: Omit<Doctor, 'id' | 'created_at' | 'updated_at'>): Promise<Doctor> {
    const response = await fetch(`${API_BASE}/doctors`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(doctor)
    })
    if (!response.ok) throw new Error('Failed to create doctor')
    return response.json()
  },

  async updateDoctor(id: string, updates: Partial<Doctor>): Promise<Doctor> {
    const response = await fetch(`${API_BASE}/doctors`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...updates })
    })
    if (!response.ok) throw new Error('Failed to update doctor')
    return response.json()
  },

  async deleteDoctor(id: string): Promise<void> {
    const response = await fetch(`${API_BASE}/doctors?id=${id}`, {
      method: 'DELETE'
    })
    if (!response.ok) throw new Error('Failed to delete doctor')
  },

  async createCredentials(credentials: { doctor_id: string; email: string; password: string }): Promise<void> {
    const response = await fetch(`${API_BASE}/credentials`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    })
    if (!response.ok) throw new Error('Failed to create credentials')
  },

  // Patient Credentials
  async createPatientCredentials(credentials: { patient_id: string; email: string; password: string }): Promise<void> {
    const response = await fetch(`${API_BASE}/patient-credentials`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    })
    if (!response.ok) throw new Error('Failed to create patient credentials')
  },

  async authenticatePatient(email: string, password: string): Promise<{ success: boolean; patient?: any }> {
    const response = await fetch(`${API_BASE}/patient-credentials?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`)
    if (!response.ok) throw new Error('Failed to authenticate patient')
    return response.json()
  },

  async loginDoctor(email: string, password: string): Promise<{ success: boolean; doctor?: Doctor; error?: string }> {
    const response = await fetch(`${API_BASE}/doctors`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })
    return response.json()
  },

  // Pacientes
  async getPatients(doctorId?: string): Promise<Patient[]> {
    const url = doctorId ? `${API_BASE}/patients?doctorId=${doctorId}` : `${API_BASE}/patients`
    const response = await fetch(url)
    if (!response.ok) throw new Error('Failed to fetch patients')
    return response.json()
  },

  async createPatient(patient: Omit<Patient, 'id' | 'created_at' | 'updated_at'>): Promise<Patient> {
    const response = await fetch(`${API_BASE}/patients`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patient)
    })
    if (!response.ok) throw new Error('Failed to create patient')
    return response.json()
  },

  async updatePatient(id: string, updates: Partial<Patient>): Promise<Patient> {
    const response = await fetch(`${API_BASE}/patients`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...updates })
    })
    if (!response.ok) throw new Error('Failed to update patient')
    return response.json()
  },

  // Citas
  async getAppointments(doctorId?: string): Promise<Appointment[]> {
    const url = doctorId ? `${API_BASE}/appointments?doctorId=${doctorId}` : `${API_BASE}/appointments`
    const response = await fetch(url)
    if (!response.ok) throw new Error('Failed to fetch appointments')
    return response.json()
  },

  async createAppointment(appointment: Omit<Appointment, 'id' | 'created_at' | 'updated_at'>): Promise<Appointment> {
    const response = await fetch(`${API_BASE}/appointments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(appointment)
    })
    if (!response.ok) throw new Error('Failed to create appointment')
    return response.json()
  },

  // Historias clínicas
  async getMedicalRecords(doctorId?: string): Promise<MedicalRecord[]> {
    const url = doctorId ? `${API_BASE}/medical-records?doctorId=${doctorId}` : `${API_BASE}/medical-records`
    const response = await fetch(url)
    if (!response.ok) throw new Error('Failed to fetch medical records')
    return response.json()
  },

  async createMedicalRecord(record: Omit<MedicalRecord, 'id' | 'created_at' | 'updated_at'>): Promise<MedicalRecord> {
    const response = await fetch(`${API_BASE}/medical-records`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(record)
    })
    if (!response.ok) throw new Error('Failed to create medical record')
    return response.json()
  },

  // Consentimientos
  async getConsents(doctorId?: string): Promise<Consent[]> {
    const url = doctorId ? `${API_BASE}/consents?doctorId=${doctorId}` : `${API_BASE}/consents`
    const response = await fetch(url)
    if (!response.ok) throw new Error('Failed to fetch consents')
    return response.json()
  },

  async createConsent(consent: Omit<Consent, 'id' | 'created_at' | 'updated_at'>): Promise<Consent> {
    const response = await fetch(`${API_BASE}/consents`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(consent)
    })
    if (!response.ok) throw new Error('Failed to create consent')
    return response.json()
  },

  // Recordatorios
  async getReminders(doctorId?: string): Promise<Reminder[]> {
    const url = doctorId ? `${API_BASE}/reminders?doctorId=${doctorId}` : `${API_BASE}/reminders`
    const response = await fetch(url)
    if (!response.ok) throw new Error('Failed to fetch reminders')
    return response.json()
  },

  async createReminder(reminder: Omit<Reminder, 'id' | 'created_at' | 'updated_at'>): Promise<Reminder> {
    const response = await fetch(`${API_BASE}/reminders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reminder)
    })
    if (!response.ok) throw new Error('Failed to create reminder')
    return response.json()
  },

  // Gestión de citas
  async updateAppointment(appointmentId: string, updates: any): Promise<any> {
    const response = await fetch(`${API_BASE}/appointments/update`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ appointmentId, updates })
    })
    if (!response.ok) throw new Error('Error al actualizar cita')
    return response.json()
  },

  // Historias clínicas
  async createClinicalHistory(patientId: string, doctorId: string, appointmentId: string | null, historyData: any): Promise<any> {
    const response = await fetch(`${API_BASE}/clinical-history`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ patientId, doctorId, appointmentId, historyData })
    })
    if (!response.ok) throw new Error('Error al crear historia clínica')
    return response.json()
  },

  async getClinicalHistories(patientId?: string, doctorId?: string): Promise<any[]> {
    const params = new URLSearchParams()
    if (patientId) params.append('patientId', patientId)
    if (doctorId) params.append('doctorId', doctorId)
    
    const response = await fetch(`${API_BASE}/clinical-history?${params.toString()}`)
    if (!response.ok) throw new Error('Error al cargar historias clínicas')
    return response.json()
  },

  // Notificaciones
  async getNotifications(userId: string, userType: 'doctor' | 'patient'): Promise<any[]> {
    const response = await fetch(`${API_BASE}/notifications?userId=${userId}&userType=${userType}`)
    if (!response.ok) throw new Error('Error al cargar notificaciones')
    return response.json()
  },

  async markNotificationAsRead(notificationId: string): Promise<any> {
    const response = await fetch(`${API_BASE}/notifications/${notificationId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isRead: true })
    })
    if (!response.ok) throw new Error('Error al marcar notificación como leída')
    return response.json()
  }
}

