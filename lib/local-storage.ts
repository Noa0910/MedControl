// Sistema de almacenamiento local para simular base de datos
import { mockPatients, mockAppointments, mockMedicalRecords, mockConsents, mockReminders, mockDoctor } from './mock-data'

// Claves para localStorage
const STORAGE_KEYS = {
  PATIENTS: 'medcontrol_patients',
  APPOINTMENTS: 'medcontrol_appointments',
  MEDICAL_RECORDS: 'medcontrol_medical_records',
  CONSENTS: 'medcontrol_consents',
  REMINDERS: 'medcontrol_reminders',
  DOCTOR: 'medcontrol_doctor'
}

// Inicializar datos si no existen
const initializeData = () => {
  if (typeof window === 'undefined') return

  if (!localStorage.getItem(STORAGE_KEYS.PATIENTS)) {
    localStorage.setItem(STORAGE_KEYS.PATIENTS, JSON.stringify(mockPatients))
  }
  if (!localStorage.getItem(STORAGE_KEYS.APPOINTMENTS)) {
    localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(mockAppointments))
  }
  if (!localStorage.getItem(STORAGE_KEYS.MEDICAL_RECORDS)) {
    localStorage.setItem(STORAGE_KEYS.MEDICAL_RECORDS, JSON.stringify(mockMedicalRecords))
  }
  if (!localStorage.getItem(STORAGE_KEYS.CONSENTS)) {
    localStorage.setItem(STORAGE_KEYS.CONSENTS, JSON.stringify(mockConsents))
  }
  if (!localStorage.getItem(STORAGE_KEYS.REMINDERS)) {
    localStorage.setItem(STORAGE_KEYS.REMINDERS, JSON.stringify(mockReminders))
  }
  if (!localStorage.getItem(STORAGE_KEYS.DOCTOR)) {
    localStorage.setItem(STORAGE_KEYS.DOCTOR, JSON.stringify(mockDoctor))
  }
}

// Funciones de utilidad
export const getData = <T>(key: string): T[] => {
  if (typeof window === 'undefined') return []
  initializeData()
  const data = localStorage.getItem(key)
  return data ? JSON.parse(data) : []
}

export const setData = <T>(key: string, data: T[]): void => {
  if (typeof window === 'undefined') return
  localStorage.setItem(key, JSON.stringify(data))
}

export const addData = <T>(key: string, newItem: T): T => {
  const data = getData<T>(key)
  const itemWithId = { ...newItem, id: Date.now().toString() }
  data.push(itemWithId)
  setData(key, data)
  return itemWithId
}

export const updateData = <T>(key: string, id: string, updates: Partial<T>): T | null => {
  const data = getData<T>(key)
  const index = data.findIndex((item: any) => item.id === id)
  if (index === -1) return null
  
  data[index] = { ...data[index], ...updates }
  setData(key, data)
  return data[index]
}

export const deleteData = <T>(key: string, id: string): boolean => {
  const data = getData<T>(key)
  const filteredData = data.filter((item: any) => item.id !== id)
  if (filteredData.length === data.length) return false
  
  setData(key, filteredData)
  return true
}

// Funciones específicas para cada entidad con filtrado por doctor
export const getPatients = (doctorId?: string) => {
  const patients = getData(STORAGE_KEYS.PATIENTS)
  return doctorId ? patients.filter((patient: any) => patient.doctor_id === doctorId) : patients
}

export const addPatient = (patient: any) => addData(STORAGE_KEYS.PATIENTS, patient)
export const updatePatient = (id: string, updates: any) => updateData(STORAGE_KEYS.PATIENTS, id, updates)
export const deletePatient = (id: string) => deleteData(STORAGE_KEYS.PATIENTS, id)

export const getAppointments = (doctorId?: string) => {
  const appointments = getData(STORAGE_KEYS.APPOINTMENTS)
  return doctorId ? appointments.filter((appointment: any) => appointment.doctor_id === doctorId) : appointments
}

export const addAppointment = (appointment: any) => addData(STORAGE_KEYS.APPOINTMENTS, appointment)
export const updateAppointment = (id: string, updates: any) => updateData(STORAGE_KEYS.APPOINTMENTS, id, updates)
export const deleteAppointment = (id: string) => deleteData(STORAGE_KEYS.APPOINTMENTS, id)

export const getMedicalRecords = (doctorId?: string) => {
  const records = getData(STORAGE_KEYS.MEDICAL_RECORDS)
  return doctorId ? records.filter((record: any) => record.doctor_id === doctorId) : records
}

export const addMedicalRecord = (record: any) => addData(STORAGE_KEYS.MEDICAL_RECORDS, record)
export const updateMedicalRecord = (id: string, updates: any) => updateData(STORAGE_KEYS.MEDICAL_RECORDS, id, updates)
export const deleteMedicalRecord = (id: string) => deleteData(STORAGE_KEYS.MEDICAL_RECORDS, id)

export const getConsents = (doctorId?: string) => {
  const consents = getData(STORAGE_KEYS.CONSENTS)
  return doctorId ? consents.filter((consent: any) => consent.doctor_id === doctorId) : consents
}

export const addConsent = (consent: any) => addData(STORAGE_KEYS.CONSENTS, consent)
export const updateConsent = (id: string, updates: any) => updateData(STORAGE_KEYS.CONSENTS, id, updates)
export const deleteConsent = (id: string) => deleteData(STORAGE_KEYS.CONSENTS, id)

export const getReminders = (doctorId?: string) => {
  const reminders = getData(STORAGE_KEYS.REMINDERS)
  return doctorId ? reminders.filter((reminder: any) => reminder.doctor_id === doctorId) : reminders
}

export const addReminder = (reminder: any) => addData(STORAGE_KEYS.REMINDERS, reminder)
export const updateReminder = (id: string, updates: any) => updateData(STORAGE_KEYS.REMINDERS, id, updates)
export const deleteReminder = (id: string) => deleteData(STORAGE_KEYS.REMINDERS, id)

export const getDoctor = () => {
  if (typeof window === 'undefined') return mockDoctor
  initializeData()
  const data = localStorage.getItem(STORAGE_KEYS.DOCTOR)
  return data ? JSON.parse(data) : mockDoctor
}
