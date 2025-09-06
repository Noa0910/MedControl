const mysql = require('mysql2/promise')

async function createTables() {
  let connection
  
  try {
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'medcontrol'
    })

    console.log('✅ Conectado a la base de datos MySQL')

    // 1. Agregar columnas a appointments
    console.log('📝 Agregando columnas a appointments...')
    await connection.execute(`
      ALTER TABLE appointments 
      ADD COLUMN IF NOT EXISTS no_show_reason VARCHAR(500) NULL,
      ADD COLUMN IF NOT EXISTS clinical_history JSON NULL,
      ADD COLUMN IF NOT EXISTS notes TEXT NULL
    `)
    console.log('✅ Columnas agregadas a appointments')

    // 2. Crear tabla clinical_history
    console.log('📝 Creando tabla clinical_history...')
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS clinical_history (
        id VARCHAR(36) PRIMARY KEY,
        patient_id VARCHAR(36) NOT NULL,
        doctor_id VARCHAR(36) NOT NULL,
        appointment_id VARCHAR(36) NULL,
        chief_complaint TEXT NOT NULL,
        current_illness TEXT NULL,
        medical_history TEXT NULL,
        surgical_history TEXT NULL,
        allergies TEXT NULL,
        medications TEXT NULL,
        vital_signs JSON NULL,
        cardiovascular_exam TEXT NULL,
        respiratory_exam TEXT NULL,
        neurological_exam TEXT NULL,
        gastrointestinal_exam TEXT NULL,
        genitourinary_exam TEXT NULL,
        musculoskeletal_exam TEXT NULL,
        dermatological_exam TEXT NULL,
        diagnosis TEXT NULL,
        treatment TEXT NULL,
        recommendations TEXT NULL,
        follow_up VARCHAR(500) NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `)
    console.log('✅ Tabla clinical_history creada')

    // 3. Crear tabla specialist_patients
    console.log('📝 Creando tabla specialist_patients...')
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS specialist_patients (
        id VARCHAR(36) PRIMARY KEY,
        doctor_id VARCHAR(36) NOT NULL,
        patient_id VARCHAR(36) NOT NULL,
        first_consultation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_consultation_date TIMESTAMP NULL,
        total_consultations INT DEFAULT 1,
        status ENUM('active', 'inactive', 'discharged') DEFAULT 'active',
        notes TEXT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY unique_doctor_patient (doctor_id, patient_id)
      )
    `)
    console.log('✅ Tabla specialist_patients creada')

    // 4. Crear tabla notifications
    console.log('📝 Creando tabla notifications...')
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS notifications (
        id VARCHAR(36) PRIMARY KEY,
        user_id VARCHAR(36) NOT NULL,
        user_type ENUM('doctor', 'patient') NOT NULL,
        title VARCHAR(200) NOT NULL,
        message TEXT NOT NULL,
        type ENUM('info', 'success', 'warning', 'error') DEFAULT 'info',
        is_read BOOLEAN DEFAULT FALSE,
        appointment_id VARCHAR(36) NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)
    console.log('✅ Tabla notifications creada')

    // 5. Crear índices
    console.log('📝 Creando índices...')
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status)',
      'CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(appointment_date)',
      'CREATE INDEX IF NOT EXISTS idx_clinical_history_patient ON clinical_history(patient_id)',
      'CREATE INDEX IF NOT EXISTS idx_clinical_history_doctor ON clinical_history(doctor_id)',
      'CREATE INDEX IF NOT EXISTS idx_specialist_patients_doctor ON specialist_patients(doctor_id)',
      'CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, user_type)',
      'CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(is_read)'
    ]

    for (const indexQuery of indexes) {
      try {
        await connection.execute(indexQuery)
      } catch (error) {
        console.log(`⚠️  Índice ya existe o error: ${error.message}`)
      }
    }
    console.log('✅ Índices creados')

    // 6. Insertar notificaciones de ejemplo
    console.log('📝 Insertando notificaciones de ejemplo...')
    try {
      await connection.execute(`
        INSERT IGNORE INTO notifications (id, user_id, user_type, title, message, type) VALUES
        ('notif_1', 'admin@medcontrol.com', 'doctor', 'Sistema Actualizado', 'Se han implementado nuevas funcionalidades de gestión de citas', 'info'),
        ('notif_2', 'admin@medcontrol.com', 'doctor', 'Nueva Funcionalidad', 'Ahora puedes gestionar citas directamente desde el calendario', 'success')
      `)
      console.log('✅ Notificaciones de ejemplo insertadas')
    } catch (error) {
      console.log(`⚠️  Error insertando notificaciones: ${error.message}`)
    }

    console.log('🎉 Base de datos actualizada exitosamente!')

  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    if (connection) {
      await connection.end()
      console.log('🔌 Conexión cerrada')
    }
  }
}

createTables()


