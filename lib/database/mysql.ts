import mysql from 'mysql2/promise'

// Configuración de la base de datos MySQL
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'medcontrol',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
}

// Pool de conexiones
let pool: mysql.Pool | null = null

export const getPool = () => {
  if (!pool) {
    pool = mysql.createPool(dbConfig)
  }
  return pool
}

// Función para inicializar la base de datos
export const initializeDatabase = async () => {
  try {
    const connection = await mysql.createConnection({
      host: dbConfig.host,
      port: dbConfig.port,
      user: dbConfig.user,
      password: dbConfig.password,
    })

    // Crear la base de datos si no existe
    await connection.execute(`CREATE DATABASE IF NOT EXISTS ${dbConfig.database}`)
    await connection.execute(`USE ${dbConfig.database}`)

    // Crear tablas
    await createTables(connection)
    
    await connection.end()
    console.log('✅ Base de datos MySQL inicializada correctamente')
  } catch (error) {
    console.error('❌ Error al inicializar la base de datos:', error)
    throw error
  }
}

// Función para crear las tablas
const createTables = async (connection: mysql.Connection) => {
  // Tabla de doctores
  await connection.execute(`
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
  await connection.execute(`
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
      emergency_contact_name VARCHAR(255),
      emergency_contact_phone VARCHAR(20),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE
    )
  `)

  // Tabla de citas
  await connection.execute(`
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
  await connection.execute(`
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
  await connection.execute(`
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
  await connection.execute(`
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

// Función para insertar datos de prueba
export const insertMockData = async () => {
  try {
    const pool = getPool()
    
    // Verificar si ya existen datos
    const [doctors] = await pool.execute('SELECT COUNT(*) as count FROM doctors')
    if ((doctors as any[])[0].count > 0) {
      console.log('ℹ️ Los datos de prueba ya existen')
      return
    }

    // Insertar doctores
    const mockDoctors = [
      {
        id: '1',
        email: 'dr.garcia@medcontrol.com',
        full_name: 'Dr. Carlos García',
        role: 'doctor',
        specialty: 'Cardiología',
        phone: '+57 300 123 4567'
      },
      {
        id: '2',
        email: 'dr.lopez@medcontrol.com',
        full_name: 'Dr. Ana López',
        role: 'doctor',
        specialty: 'Dermatología',
        phone: '+57 300 234 5678'
      },
      {
        id: '3',
        email: 'dra.hernandez@medcontrol.com',
        full_name: 'Dra. María Hernández',
        role: 'doctor',
        specialty: 'Pediatría',
        phone: '+57 300 345 6789'
      }
    ]

    for (const doctor of mockDoctors) {
      await pool.execute(
        'INSERT INTO doctors (id, email, full_name, role, specialty, phone) VALUES (?, ?, ?, ?, ?, ?)',
        [doctor.id, doctor.email, doctor.full_name, doctor.role, doctor.specialty, doctor.phone]
      )
    }

    console.log('✅ Datos de prueba insertados correctamente')
  } catch (error) {
    console.error('❌ Error al insertar datos de prueba:', error)
    throw error
  }
}



