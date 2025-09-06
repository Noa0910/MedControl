'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/layout/Header'
import LoginForm from '@/components/auth/LoginForm'
import { Heart, Stethoscope, Users, Calendar, FileText, Shield, Clock, CheckCircle, User } from 'lucide-react'

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    // Verificar si hay un paciente logueado y redirigir al dashboard
    const patientData = localStorage.getItem('medcontrol_patient')
    if (patientData) {
      console.log('👤 Paciente logueado detectado en página principal, redirigiendo al dashboard')
      router.push('/paciente/dashboard')
      return
    }

    // Verificar si hay un doctor logueado y redirigir al dashboard
    const doctorData = localStorage.getItem('medcontrol_user')
    if (doctorData) {
      console.log('👨‍⚕️ Doctor logueado detectado en página principal, redirigiendo al dashboard')
      router.push('/dashboard')
      return
    }
  }, [router])
  return (
    <div className="min-h-screen bg-gradient-to-br from-medical-50 to-primary-50">
      {/* Header con Login */}
      <Header />
      
      {/* Hero Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <div className="flex items-center justify-center mb-6">
              <div className="bg-primary-600 p-4 rounded-full">
                <Heart className="w-12 h-12 text-white" />
              </div>
            </div>
            <h1 className="text-6xl font-bold text-gray-900 mb-6">
              MedControl
            </h1>
            <p className="text-2xl text-gray-600 mb-8">
              Sistema de Gestión Médica Integral
            </p>
            <p className="text-lg text-gray-500 mb-12 max-w-2xl mx-auto">
              La solución completa para la gestión de consultorios médicos, 
              historias clínicas digitales y agendamiento de citas.
            </p>
          </div>
        </div>
      </section>

      {/* Características Principales */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              ¿Por qué elegir MedControl?
            </h2>
            <p className="text-xl text-gray-600">
              Herramientas profesionales para profesionales de la salud
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Stethoscope className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Gestión de Pacientes</h3>
              <p className="text-gray-600">
                Administra de manera eficiente la información de tus pacientes, 
                historias clínicas y seguimiento médico.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Agendamiento Inteligente</h3>
              <p className="text-gray-600">
                Sistema de citas automatizado con recordatorios por email y WhatsApp 
                para mejorar la asistencia de pacientes.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Historia Clínica Digital</h3>
              <p className="text-gray-600">
                Registros médicos digitales seguros, consentimientos informados 
                y seguimiento completo del tratamiento.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Funcionalidades Detalladas */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Funcionalidades Principales
            </h2>
            <p className="text-xl text-gray-600">
              Todo lo que necesitas para gestionar tu consultorio médico
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto">
            <div className="space-y-8">
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Dashboard Personalizado</h3>
                  <p className="text-gray-600">Vista general de tu práctica médica con estadísticas en tiempo real.</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Gestión de Citas</h3>
                  <p className="text-gray-600">Programa, modifica y cancela citas con facilidad.</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Registro de Pacientes</h3>
                  <p className="text-gray-600">Base de datos completa con información médica y de contacto.</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Consentimientos Informados</h3>
                  <p className="text-gray-600">Gestión digital de consentimientos y documentos legales.</p>
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Recordatorios Automáticos</h3>
                  <p className="text-gray-600">Notificaciones por email y WhatsApp para pacientes y médicos.</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Seguridad y Privacidad</h3>
                  <p className="text-gray-600">Cumplimiento con normativas de protección de datos médicos.</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Acceso Multi-Especialista</h3>
                  <p className="text-gray-600">Cada especialista tiene su propio espacio independiente.</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Interfaz Intuitiva</h3>
                  <p className="text-gray-600">Diseño moderno y fácil de usar para todos los usuarios.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Patient Access Section */}
      <section className="py-20 bg-gradient-to-r from-green-50 to-blue-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              ¿Eres Paciente?
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Regístrate y agenda tu cita médica de forma rápida y sencilla
            </p>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white p-8 rounded-lg shadow-sm border">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Registro Rápido</h3>
                <p className="text-gray-600 mb-6">
                  Completa un formulario simple con tus datos básicos y comienza a agendar citas inmediatamente.
                </p>
                <a
                  href="/registro"
                  className="inline-flex items-center px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
                >
                  Registrarse Ahora
                </a>
              </div>
              
              <div className="bg-white p-8 rounded-lg shadow-sm border">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Agenda tu Cita</h3>
                <p className="text-gray-600 mb-6">
                  Selecciona tu especialista, elige fecha y hora, y confirma tu cita médica.
                </p>
                <div className="space-y-2">
                  <a
                    href="/agendar"
                    className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Agendar Cita
                  </a>
                  <p className="text-xs text-gray-500">
                    ¿Ya tienes cuenta?{' '}
                    <a
                      href="/paciente/login"
                      className="text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Iniciar sesión
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary-600">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            ¿Eres Profesional de la Salud?
          </h2>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            Únete a los profesionales de la salud que ya confían en MedControl 
            para gestionar su práctica médica.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
              Ver Demo
            </button>
            <button className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-primary-600 transition-colors">
              Contactar Ventas
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <Heart className="w-8 h-8 text-primary-400 mr-2" />
              <span className="text-2xl font-bold">MedControl</span>
            </div>
            <p className="text-gray-400 mb-4">
              Sistema de Gestión Médica Integral
            </p>
            <div className="p-4 bg-blue-900 border border-blue-700 rounded-lg max-w-2xl mx-auto">
              <p className="text-sm text-blue-200">
                <strong>Modo Demo:</strong> Este sistema funciona completamente sin base de datos. 
                Los datos se almacenan localmente en tu navegador para demostrar todas las funcionalidades.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}