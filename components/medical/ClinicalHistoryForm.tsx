'use client'

import { useState } from 'react'
import { FileText, User, Calendar, Stethoscope, Pill, Heart, Brain, Eye } from 'lucide-react'

interface Patient {
  first_name: string
  last_name: string
  phone?: string
  email?: string
  date_of_birth?: string
  gender?: string
  address?: string
}

interface ClinicalHistoryFormProps {
  patient: Patient
  onSave: (historyData: any) => void
  onClose: () => void
}

export default function ClinicalHistoryForm({ patient, onSave, onClose }: ClinicalHistoryFormProps) {
  const [formData, setFormData] = useState({
    // Información general
    chiefComplaint: '',
    currentIllness: '',
    medicalHistory: '',
    surgicalHistory: '',
    allergies: '',
    medications: '',
    
    // Examen físico
    vitalSigns: {
      bloodPressure: '',
      heartRate: '',
      temperature: '',
      respiratoryRate: '',
      oxygenSaturation: ''
    },
    
    // Examen por sistemas
    cardiovascular: '',
    respiratory: '',
    neurological: '',
    gastrointestinal: '',
    genitourinary: '',
    musculoskeletal: '',
    dermatological: '',
    
    // Diagnóstico y tratamiento
    diagnosis: '',
    treatment: '',
    recommendations: '',
    followUp: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('🔄 Formulario de historia clínica enviado:', formData)
    onSave(formData)
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleVitalSignsChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      vitalSigns: {
        ...prev.vitalSigns,
        [field]: value
      }
    }))
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Historia Clínica
                </h2>
                <p className="text-sm text-gray-600">
                  {patient.first_name} {patient.last_name}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          {/* Información General */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <User className="w-5 h-5 mr-2" />
              Información General
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Motivo de Consulta *
                </label>
                <textarea
                  value={formData.chiefComplaint}
                  onChange={(e) => handleInputChange('chiefComplaint', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Describa el motivo principal de la consulta"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Enfermedad Actual
                </label>
                <textarea
                  value={formData.currentIllness}
                  onChange={(e) => handleInputChange('currentIllness', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Historia detallada de la enfermedad actual"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Antecedentes Médicos
                </label>
                <textarea
                  value={formData.medicalHistory}
                  onChange={(e) => handleInputChange('medicalHistory', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Enfermedades previas, hospitalizaciones, etc."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Antecedentes Quirúrgicos
                </label>
                <textarea
                  value={formData.surgicalHistory}
                  onChange={(e) => handleInputChange('surgicalHistory', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Cirugías previas, fechas, complicaciones"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Alergias
                </label>
                <input
                  type="text"
                  value={formData.allergies}
                  onChange={(e) => handleInputChange('allergies', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Medicamentos, alimentos, sustancias"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Medicamentos Actuales
                </label>
                <textarea
                  value={formData.medications}
                  onChange={(e) => handleInputChange('medications', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={2}
                  placeholder="Medicamentos, dosis, frecuencia"
                />
              </div>
            </div>
          </div>

          {/* Signos Vitales */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Heart className="w-5 h-5 mr-2" />
              Signos Vitales
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Presión Arterial
                </label>
                <input
                  type="text"
                  value={formData.vitalSigns.bloodPressure}
                  onChange={(e) => handleVitalSignsChange('bloodPressure', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="120/80"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Frecuencia Cardíaca
                </label>
                <input
                  type="text"
                  value={formData.vitalSigns.heartRate}
                  onChange={(e) => handleVitalSignsChange('heartRate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="80 bpm"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Temperatura
                </label>
                <input
                  type="text"
                  value={formData.vitalSigns.temperature}
                  onChange={(e) => handleVitalSignsChange('temperature', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="36.5°C"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Frecuencia Respiratoria
                </label>
                <input
                  type="text"
                  value={formData.vitalSigns.respiratoryRate}
                  onChange={(e) => handleVitalSignsChange('respiratoryRate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="16 rpm"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Saturación O2
                </label>
                <input
                  type="text"
                  value={formData.vitalSigns.oxygenSaturation}
                  onChange={(e) => handleVitalSignsChange('oxygenSaturation', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="98%"
                />
              </div>
            </div>
          </div>

          {/* Examen por Sistemas */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Stethoscope className="w-5 h-5 mr-2" />
              Examen por Sistemas
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cardiovascular
                </label>
                <textarea
                  value={formData.cardiovascular}
                  onChange={(e) => handleInputChange('cardiovascular', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={2}
                  placeholder="Ritmo, soplos, edemas, etc."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Respiratorio
                </label>
                <textarea
                  value={formData.respiratory}
                  onChange={(e) => handleInputChange('respiratory', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={2}
                  placeholder="Ruidos respiratorios, disnea, etc."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Neurológico
                </label>
                <textarea
                  value={formData.neurological}
                  onChange={(e) => handleInputChange('neurological', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={2}
                  placeholder="Estado mental, reflejos, coordinación, etc."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Gastrointestinal
                </label>
                <textarea
                  value={formData.gastrointestinal}
                  onChange={(e) => handleInputChange('gastrointestinal', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={2}
                  placeholder="Abdomen, hígado, bazo, etc."
                />
              </div>
            </div>
          </div>

          {/* Diagnóstico y Tratamiento */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Pill className="w-5 h-5 mr-2" />
              Diagnóstico y Tratamiento
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Diagnóstico
                </label>
                <textarea
                  value={formData.diagnosis}
                  onChange={(e) => handleInputChange('diagnosis', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Diagnóstico principal y diagnósticos diferenciales"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tratamiento
                </label>
                <textarea
                  value={formData.treatment}
                  onChange={(e) => handleInputChange('treatment', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Medicamentos, procedimientos, recomendaciones"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Recomendaciones
                </label>
                <textarea
                  value={formData.recommendations}
                  onChange={(e) => handleInputChange('recommendations', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={2}
                  placeholder="Recomendaciones para el paciente"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Control de Seguimiento
                </label>
                <input
                  type="text"
                  value={formData.followUp}
                  onChange={(e) => handleInputChange('followUp', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Fecha de control, especialista, etc."
                />
              </div>
            </div>
          </div>

          {/* Botones */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Guardar Historia Clínica
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
