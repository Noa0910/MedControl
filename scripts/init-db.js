const mysql = require('mysql2/promise')
const { v4: uuidv4 } = require('uuid')

// Configuración de la base de datos
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'medcontrol',
}

async function initializeDatabase() {
  let connection
  
  try {
    console.log('🔄 Inicializando base de datos MySQL...')
    
    // Conectar sin especificar base de datos para crearla
    connection = await mysql.createConnection({
      host: dbConfig.host,
      port: dbConfig.port,
      user: dbConfig.user,
      password: dbConfig.password,
    })

    // Crear la base de datos si no existe
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\``)
    await connection.query(`USE \`${dbConfig.database}\``)
    console.log('✅ Base de datos creada/verificada')

    // Crear tablas
    await createTables(connection)
    
    // Insertar datos de prueba
    await insertMockData(connection)
    
    console.log('🎉 Base de datos inicializada correctamente!')
    console.log('📊 Puedes verificar en phpMyAdmin: http://localhost/phpmyadmin')
    
  } catch (error) {
    console.error('❌ Error al inicializar la base de datos:', error.message)
    console.log('\n🔧 Verifica que:')
    console.log('1. XAMPP esté ejecutándose')
    console.log('2. MySQL esté iniciado en XAMPP')
    console.log('3. Las credenciales en .env.local sean correctas')
    process.exit(1)
  } finally {
    if (connection) {
      await connection.end()
    }
  }
}

async function createTables(connection) {
  console.log('🔄 Creando tablas...')
  
  // Tabla de doctores
  await connection.query(`
    CREATE TABLE IF NOT EXISTS doctors (
      id VARCHAR(36) PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      full_name VARCHAR(255) NOT NULL,
      role ENUM('doctor', 'admin', 'nurse') NOT NULL,
      specialty VARCHAR(255),
      phone VARCHAR(20),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `)

  // Tabla de pacientes
  await connection.query(`
    CREATE TABLE IF NOT EXISTS patients (
      id VARCHAR(36) PRIMARY KEY,
      doctor_id VARCHAR(36) NOT NULL,
      first_name VARCHAR(255) NOT NULL,
      last_name VARCHAR(255) NOT NULL,
      email VARCHAR(255),
      phone VARCHAR(20),
      date_of_birth DATE,
      gender ENUM('male', 'female', 'other'),
      address TEXT,
      document_type VARCHAR(50),
      document_number VARCHAR(50),
      eps VARCHAR(255),
      marital_status VARCHAR(50),
      occupation VARCHAR(255),
      emergency_contact_name VARCHAR(255),
      emergency_contact_phone VARCHAR(20),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE
    )
  `)

  // Tabla de citas
  await connection.query(`
    CREATE TABLE IF NOT EXISTS appointments (
      id VARCHAR(36) PRIMARY KEY,
      doctor_id VARCHAR(36) NOT NULL,
      patient_id VARCHAR(36) NOT NULL,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      appointment_date DATE NOT NULL,
      appointment_time TIME NOT NULL,
      status ENUM('scheduled', 'confirmed', 'completed', 'cancelled', 'no_show') DEFAULT 'scheduled',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE,
      FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
    )
  `)

  // Tabla de historias clínicas
  await connection.query(`
    CREATE TABLE IF NOT EXISTS medical_records (
      id VARCHAR(36) PRIMARY KEY,
      doctor_id VARCHAR(36) NOT NULL,
      patient_id VARCHAR(36) NOT NULL,
      title VARCHAR(255) NOT NULL,
      diagnosis TEXT,
      treatment TEXT,
      notes TEXT,
      record_date DATE NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE,
      FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
    )
  `)

  // Tabla de consentimientos
  await connection.query(`
    CREATE TABLE IF NOT EXISTS consents (
      id VARCHAR(36) PRIMARY KEY,
      doctor_id VARCHAR(36) NOT NULL,
      patient_id VARCHAR(36) NOT NULL,
      title VARCHAR(255) NOT NULL,
      content TEXT NOT NULL,
      consent_type ENUM('treatment', 'surgery', 'privacy', 'data_processing', 'other') NOT NULL,
      is_signed BOOLEAN DEFAULT FALSE,
      signed_at TIMESTAMP NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE,
      FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
    )
  `)

  // Tabla de recordatorios
  await connection.query(`
    CREATE TABLE IF NOT EXISTS reminders (
      id VARCHAR(36) PRIMARY KEY,
      doctor_id VARCHAR(36) NOT NULL,
      patient_id VARCHAR(36) NOT NULL,
      appointment_id VARCHAR(36),
      title VARCHAR(255) NOT NULL,
      message TEXT NOT NULL,
      reminder_type ENUM('appointment', 'medication', 'follow_up', 'other') NOT NULL,
      reminder_date DATE NOT NULL,
      reminder_time TIME NOT NULL,
      status ENUM('pending', 'sent', 'failed') DEFAULT 'pending',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE,
      FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
      FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE SET NULL
    )
  `)

  console.log('✅ Tablas creadas correctamente')
}

async function insertMockData(connection) {
  console.log('🔄 Insertando datos de prueba...')
  
      // Verificar si ya existen datos
    const [doctors] = await connection.query('SELECT COUNT(*) as count FROM doctors')
    if (doctors[0].count > 0) {
      console.log('ℹ️ Los datos de prueba ya existen')
      return
    }

  // Insertar doctores y administrador
  const mockDoctors = [
    {
      id: uuidv4(),
      email: 'admin@medcontrol.com',
      full_name: 'Administrador del Sistema',
      role: 'admin',
      specialty: 'Administración',
      phone: '+57 300 000 0000'
    },
    {
      id: uuidv4(),
      email: 'dr.garcia@medcontrol.com',
      full_name: 'Dr. Carlos García',
      role: 'doctor',
      specialty: 'Cardiología',
      phone: '+57 300 123 4567'
    },
    {
      id: uuidv4(),
      email: 'dr.lopez@medcontrol.com',
      full_name: 'Dr. Ana López',
      role: 'doctor',
      specialty: 'Dermatología',
      phone: '+57 300 234 5678'
    },
    {
      id: uuidv4(),
      email: 'dra.hernandez@medcontrol.com',
      full_name: 'Dra. María Hernández',
      role: 'doctor',
      specialty: 'Pediatría',
      phone: '+57 300 345 6789'
    }
  ]

      for (const doctor of mockDoctors) {
      await connection.query(
        'INSERT INTO doctors (id, email, full_name, role, specialty, phone) VALUES (?, ?, ?, ?, ?, ?)',
        [doctor.id, doctor.email, doctor.full_name, doctor.role, doctor.specialty, doctor.phone]
      )
    }

  console.log('✅ Datos de prueba insertados correctamente')
  console.log('\n👨‍⚕️ Doctores creados:')
  mockDoctors.forEach(doctor => {
    console.log(`   - ${doctor.full_name} (${doctor.specialty})`)
    console.log(`     Email: ${doctor.email}`)
    console.log(`     Contraseña: 123456`)
  })
}

// Ejecutar si se llama directamente
if (require.main === module) {
  initializeDatabase()
}

module.exports = { initializeDatabase }
