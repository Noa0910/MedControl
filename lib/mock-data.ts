// Datos mock para el sistema MedControl
export const mockDoctors = [
  {
    id: 'dr-garcia',
    email: 'dr.garcia@medcontrol.com',
    full_name: 'Dr. García',
    role: 'doctor' as const,
    specialty: 'Cardiología',
    phone: '+52 55 1111 1111',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'dr-lopez',
    email: 'dr.lopez@medcontrol.com',
    full_name: 'Dr. López',
    role: 'doctor' as const,
    specialty: 'Pediatría',
    phone: '+52 55 2222 2222',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'dr-hernandez',
    email: 'dra.hernandez@medcontrol.com',
    full_name: 'Dra. Hernández',
    role: 'doctor' as const,
    specialty: 'Ginecología',
    phone: '+52 55 3333 3333',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  }
]

export const mockPatients = [
  {
    id: '1',
    first_name: 'María',
    last_name: 'González',
    email: 'maria.gonzalez@email.com',
    phone: '+1234567890',
    date_of_birth: '1985-03-15',
    gender: 'female' as const,
    address: 'Calle Principal 123, Ciudad',
    emergency_contact: 'Juan González',
    emergency_phone: '+1234567891',
    medical_insurance: 'Seguro Médico ABC',
    insurance_number: 'ABC123456',
    doctor_id: 'dr-garcia', // Asignado al Dr. García
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z'
  },
  {
    id: '2',
    first_name: 'Carlos',
    last_name: 'Rodríguez',
    email: 'carlos.rodriguez@email.com',
    phone: '+1234567892',
    date_of_birth: '1978-07-22',
    gender: 'male' as const,
    address: 'Avenida Central 456, Ciudad',
    emergency_contact: 'Ana Rodríguez',
    emergency_phone: '+1234567893',
    medical_insurance: 'Seguro Médico XYZ',
    insurance_number: 'XYZ789012',
    doctor_id: 'dr-garcia', // Asignado al Dr. García
    created_at: '2024-01-20T14:30:00Z',
    updated_at: '2024-01-20T14:30:00Z'
  },
  {
    id: '3',
    first_name: 'Laura',
    last_name: 'Martínez',
    email: 'laura.martinez@email.com',
    phone: '+1234567894',
    date_of_birth: '1992-11-08',
    gender: 'female' as const,
    address: 'Calle Secundaria 789, Ciudad',
    emergency_contact: 'Pedro Martínez',
    emergency_phone: '+1234567895',
    medical_insurance: 'Seguro Médico DEF',
    insurance_number: 'DEF345678',
    doctor_id: 'dr-lopez', // Asignado al Dr. López
    created_at: '2024-02-01T09:15:00Z',
    updated_at: '2024-02-01T09:15:00Z'
  },
  {
    id: '4',
    first_name: 'Ana',
    last_name: 'Silva',
    email: 'ana.silva@email.com',
    phone: '+1234567896',
    date_of_birth: '1988-05-12',
    gender: 'female' as const,
    address: 'Calle Condesa 321, Ciudad',
    emergency_contact: 'Luis Silva',
    emergency_phone: '+1234567897',
    medical_insurance: 'Seguro Médico GHI',
    insurance_number: 'GHI456789',
    doctor_id: 'dr-hernandez', // Asignado a la Dra. Hernández
    created_at: '2024-02-05T11:20:00Z',
    updated_at: '2024-02-05T11:20:00Z'
  }
]

export const mockAppointments = [
  {
    id: '1',
    patient_id: '1',
    doctor_id: 'dr-garcia', // Cita del Dr. García
    appointment_date: '2024-12-15',
    appointment_time: '09:00',
    duration: 30,
    status: 'scheduled' as const,
    reason: 'Consulta de cardiología',
    notes: 'Paciente con síntomas de arritmia',
    created_at: '2024-12-01T10:00:00Z',
    updated_at: '2024-12-01T10:00:00Z',
    patients: mockPatients[0]
  },
  {
    id: '2',
    patient_id: '2',
    doctor_id: 'dr-garcia', // Cita del Dr. García
    appointment_date: '2024-12-15',
    appointment_time: '10:30',
    duration: 45,
    status: 'confirmed' as const,
    reason: 'Seguimiento cardiológico',
    notes: 'Control de presión arterial y electrocardiograma',
    created_at: '2024-12-02T11:00:00Z',
    updated_at: '2024-12-02T11:00:00Z',
    patients: mockPatients[1]
  },
  {
    id: '3',
    patient_id: '3',
    doctor_id: 'dr-lopez', // Cita del Dr. López
    appointment_date: '2024-12-16',
    appointment_time: '14:00',
    duration: 30,
    status: 'scheduled' as const,
    reason: 'Consulta pediátrica',
    notes: 'Control de crecimiento y desarrollo',
    created_at: '2024-12-03T15:30:00Z',
    updated_at: '2024-12-03T15:30:00Z',
    patients: mockPatients[2]
  },
  {
    id: '4',
    patient_id: '4',
    doctor_id: 'dr-hernandez', // Cita de la Dra. Hernández
    appointment_date: '2024-12-17',
    appointment_time: '11:00',
    duration: 40,
    status: 'scheduled' as const,
    reason: 'Consulta ginecológica',
    notes: 'Control anual y citología',
    created_at: '2024-12-04T09:15:00Z',
    updated_at: '2024-12-04T09:15:00Z',
    patients: mockPatients[3]
  }
]

export const mockMedicalRecords = [
  {
    id: '1',
    patient_id: '1',
    doctor_id: 'demo-user',
    appointment_id: '1',
    record_date: '2024-12-10',
    chief_complaint: 'Dolor de cabeza y congestión nasal',
    history_of_present_illness: 'Síntomas iniciaron hace 3 días, empeorando gradualmente',
    physical_examination: 'Temperatura 37.2°C, presión arterial normal, congestión nasal leve',
    diagnosis: 'Resfriado común',
    treatment_plan: 'Reposo, hidratación, descongestionante nasal',
    prescriptions: 'Paracetamol 500mg cada 8 horas por 3 días',
    follow_up_notes: 'Cita de seguimiento en 1 semana si persisten síntomas',
    vital_signs: 'TA: 120/80, FC: 72, FR: 16, Temp: 37.2°C',
    created_at: '2024-12-10T10:00:00Z',
    updated_at: '2024-12-10T10:00:00Z',
    patients: mockPatients[0],
    profiles: {
      full_name: 'Dr. Demo',
      specialty: 'Medicina General'
    }
  }
]

export const mockConsents = [
  {
    id: '1',
    patient_id: '1',
    doctor_id: 'demo-user',
    appointment_id: '1',
    form_type: 'general_consent' as const,
    consent_given: true,
    consent_date: '2024-12-10',
    witness_name: 'Ana González',
    additional_notes: 'Consentimiento otorgado para tratamiento general',
    created_at: '2024-12-10T10:00:00Z',
    updated_at: '2024-12-10T10:00:00Z',
    patients: mockPatients[0],
    profiles: {
      full_name: 'Dr. Demo'
    }
  }
]

export const mockReminders = [
  {
    id: '1',
    appointment_id: '1',
    patient_id: '1',
    reminder_type: 'email' as const,
    scheduled_time: '2024-12-14T20:00:00Z',
    sent: true,
    sent_at: '2024-12-14T20:00:00Z',
    message: 'Recordatorio: Tienes una cita mañana a las 09:00',
    created_at: '2024-12-13T10:00:00Z',
    appointments: {
      appointment_date: '2024-12-15',
      appointment_time: '09:00',
      reason: 'Consulta general de rutina',
      patients: mockPatients[0]
    }
  }
]

export const mockDoctor = {
  id: 'demo-user',
  email: 'demo@medcontrol.com',
  full_name: 'Dr. Demo',
  role: 'doctor' as const,
  specialty: 'Medicina General',
  phone: '+1234567890',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z'
}
