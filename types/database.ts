export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string
          role: 'doctor' | 'admin' | 'nurse'
          specialty?: string
          phone?: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name: string
          role: 'doctor' | 'admin' | 'nurse'
          specialty?: string
          phone?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string
          role?: 'doctor' | 'admin' | 'nurse'
          specialty?: string
          phone?: string
          created_at?: string
          updated_at?: string
        }
      }
      patients: {
        Row: {
          id: string
          first_name: string
          last_name: string
          email?: string
          phone?: string
          date_of_birth: string
          gender: 'male' | 'female' | 'other'
          address?: string
          emergency_contact?: string
          emergency_phone?: string
          medical_insurance?: string
          insurance_number?: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          first_name: string
          last_name: string
          email?: string
          phone?: string
          date_of_birth: string
          gender: 'male' | 'female' | 'other'
          address?: string
          emergency_contact?: string
          emergency_phone?: string
          medical_insurance?: string
          insurance_number?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          first_name?: string
          last_name?: string
          email?: string
          phone?: string
          date_of_birth?: string
          gender?: 'male' | 'female' | 'other'
          address?: string
          emergency_contact?: string
          emergency_phone?: string
          medical_insurance?: string
          insurance_number?: string
          created_at?: string
          updated_at?: string
        }
      }
      appointments: {
        Row: {
          id: string
          patient_id: string
          doctor_id: string
          appointment_date: string
          appointment_time: string
          duration: number
          status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show'
          reason: string
          notes?: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          patient_id: string
          doctor_id: string
          appointment_date: string
          appointment_time: string
          duration: number
          status?: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show'
          reason: string
          notes?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          patient_id?: string
          doctor_id?: string
          appointment_date?: string
          appointment_time?: string
          duration?: number
          status?: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show'
          reason?: string
          notes?: string
          created_at?: string
          updated_at?: string
        }
      }
      medical_records: {
        Row: {
          id: string
          patient_id: string
          doctor_id: string
          appointment_id?: string
          record_date: string
          chief_complaint: string
          history_of_present_illness: string
          physical_examination: string
          diagnosis: string
          treatment_plan: string
          prescriptions?: string
          follow_up_notes?: string
          vital_signs?: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          patient_id: string
          doctor_id: string
          appointment_id?: string
          record_date: string
          chief_complaint: string
          history_of_present_illness: string
          physical_examination: string
          diagnosis: string
          treatment_plan: string
          prescriptions?: string
          follow_up_notes?: string
          vital_signs?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          patient_id?: string
          doctor_id?: string
          appointment_id?: string
          record_date?: string
          chief_complaint?: string
          history_of_present_illness?: string
          physical_examination?: string
          diagnosis?: string
          treatment_plan?: string
          prescriptions?: string
          follow_up_notes?: string
          vital_signs?: string
          created_at?: string
          updated_at?: string
        }
      }
      consent_forms: {
        Row: {
          id: string
          patient_id: string
          doctor_id: string
          appointment_id?: string
          form_type: 'general_consent' | 'surgical_consent' | 'privacy_consent' | 'treatment_consent'
          consent_given: boolean
          consent_date: string
          witness_name?: string
          witness_signature?: string
          patient_signature?: string
          doctor_signature?: string
          additional_notes?: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          patient_id: string
          doctor_id: string
          appointment_id?: string
          form_type: 'general_consent' | 'surgical_consent' | 'privacy_consent' | 'treatment_consent'
          consent_given: boolean
          consent_date: string
          witness_name?: string
          witness_signature?: string
          patient_signature?: string
          doctor_signature?: string
          additional_notes?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          patient_id?: string
          doctor_id?: string
          appointment_id?: string
          form_type?: 'general_consent' | 'surgical_consent' | 'privacy_consent' | 'treatment_consent'
          consent_given?: boolean
          consent_date?: string
          witness_name?: string
          witness_signature?: string
          patient_signature?: string
          doctor_signature?: string
          additional_notes?: string
          created_at?: string
          updated_at?: string
        }
      }
      reminders: {
        Row: {
          id: string
          appointment_id: string
          patient_id: string
          reminder_type: 'email' | 'sms' | 'call'
          scheduled_time: string
          sent: boolean
          sent_at?: string
          message?: string
          created_at: string
        }
        Insert: {
          id?: string
          appointment_id: string
          patient_id: string
          reminder_type: 'email' | 'sms' | 'call'
          scheduled_time: string
          sent?: boolean
          sent_at?: string
          message?: string
          created_at?: string
        }
        Update: {
          id?: string
          appointment_id?: string
          patient_id?: string
          reminder_type?: 'email' | 'sms' | 'call'
          scheduled_time?: string
          sent?: boolean
          sent_at?: string
          message?: string
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}





