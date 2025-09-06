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

async function insertTestPatients() {
  let connection
  
  try {
    console.log('🔄 Insertando pacientes de prueba...')
    
    // Conectar a la base de datos
    connection = await mysql.createConnection(dbConfig)
    console.log('✅ Conectado a la base de datos')

    // Obtener el primer doctor disponible
    const [doctors] = await connection.query('SELECT id FROM doctors LIMIT 1')
    if (doctors.length === 0) {
      throw new Error('No hay doctores en la base de datos')
    }
    const doctorId = doctors[0].id
    console.log(`👨‍⚕️ Usando doctor ID: ${doctorId}`)

    // Pacientes de prueba con datos completos
    const testPatients = [
      {
        id: uuidv4(),
        doctor_id: doctorId,
        first_name: 'Ana',
        last_name: 'Navarro',
        email: 'ana.navarro@email.com',
        phone: '+573016470592',
        date_of_birth: '1995-03-15',
        gender: 'female',
        address: 'Calle 123 #45-67, Bogotá',
        document_type: 'CC',
        document_number: '1005813642',
        eps: 'Sura',
        marital_status: 'Soltera',
        occupation: 'Ingeniera'
      },
      {
        id: uuidv4(),
        doctor_id: doctorId,
        first_name: 'Carlos',
        last_name: 'Mendoza',
        email: 'carlos.mendoza@email.com',
        phone: '+573001234567',
        date_of_birth: '1988-07-22',
        gender: 'male',
        address: 'Carrera 45 #78-90, Medellín',
        document_type: 'CC',
        document_number: '1234567890',
        eps: 'Nueva EPS',
        marital_status: 'Casado',
        occupation: 'Médico'
      },
      {
        id: uuidv4(),
        doctor_id: doctorId,
        first_name: 'María',
        last_name: 'González',
        email: 'maria.gonzalez@email.com',
        phone: '+573009876543',
        date_of_birth: '1992-11-08',
        gender: 'female',
        address: 'Avenida 68 #12-34, Cali',
        document_type: 'CC',
        document_number: '9876543210',
        eps: 'Sanitas',
        marital_status: 'Divorciada',
        occupation: 'Enfermera'
      }
    ]

    // Insertar pacientes
    for (const patient of testPatients) {
      console.log(`➕ Insertando paciente: ${patient.first_name} ${patient.last_name}`)
      await connection.query(`
        INSERT INTO patients (
          id, doctor_id, first_name, last_name, email, phone, 
          date_of_birth, gender, address, document_type, 
          document_number, eps, marital_status, occupation,
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      `, [
        patient.id, patient.doctor_id, patient.first_name, patient.last_name,
        patient.email, patient.phone, patient.date_of_birth, patient.gender,
        patient.address, patient.document_type, patient.document_number,
        patient.eps, patient.marital_status, patient.occupation
      ])
    }

    // Crear algunas citas de prueba
    const testAppointments = [
      {
        id: uuidv4(),
        doctor_id: doctorId,
        patient_id: testPatients[0].id,
        title: 'Consulta General',
        description: 'Revisión médica general',
        appointment_date: '2024-12-15',
        appointment_time: '10:00:00',
        status: 'scheduled'
      },
      {
        id: uuidv4(),
        doctor_id: doctorId,
        patient_id: testPatients[1].id,
        title: 'Control Cardiológico',
        description: 'Seguimiento de tratamiento cardíaco',
        appointment_date: '2024-12-16',
        appointment_time: '14:30:00',
        status: 'scheduled'
      },
      {
        id: uuidv4(),
        doctor_id: doctorId,
        patient_id: testPatients[2].id,
        title: 'Consulta Dermatológica',
        description: 'Revisión de manchas en la piel',
        appointment_date: '2024-12-17',
        appointment_time: '09:15:00',
        status: 'scheduled'
      }
    ]

    // Insertar citas
    for (const appointment of testAppointments) {
      console.log(`📅 Insertando cita para: ${appointment.title}`)
      await connection.query(`
        INSERT INTO appointments (
          id, doctor_id, patient_id, title, description,
          appointment_date, appointment_time, status,
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      `, [
        appointment.id, appointment.doctor_id, appointment.patient_id,
        appointment.title, appointment.description, appointment.appointment_date,
        appointment.appointment_time, appointment.status
      ])
    }

    // Verificar datos insertados
    const [patientCount] = await connection.query('SELECT COUNT(*) as count FROM patients')
    const [appointmentCount] = await connection.query('SELECT COUNT(*) as count FROM appointments')
    
    console.log(`\n📊 Resumen de datos insertados:`)
    console.log(`   - Pacientes: ${patientCount[0].count}`)
    console.log(`   - Citas: ${appointmentCount[0].count}`)

    console.log('\n👥 Pacientes creados:')
    testPatients.forEach(patient => {
      console.log(`   - ${patient.first_name} ${patient.last_name} (${patient.document_type} ${patient.document_number})`)
    })

    console.log('\n🎉 Datos de prueba insertados correctamente!')
    console.log('💡 Ahora puedes probar el flujo de atención de citas')
    
  } catch (error) {
    console.error('❌ Error al insertar datos de prueba:', error.message)
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

// Ejecutar si se llama directamente
if (require.main === module) {
  insertTestPatients()
}

module.exports = { insertTestPatients }
