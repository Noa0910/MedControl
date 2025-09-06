const mysql = require('mysql2/promise')

// Configuración de la base de datos
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'medcontrol',
}

async function cleanPatientsDatabase() {
  let connection
  
  try {
    console.log('🔄 Limpiando base de datos de pacientes...')
    
    // Conectar a la base de datos
    connection = await mysql.createConnection(dbConfig)
    console.log('✅ Conectado a la base de datos')

    // Verificar cuántos pacientes hay
    const [countResult] = await connection.query('SELECT COUNT(*) as count FROM patients')
    const patientCount = countResult[0].count
    console.log(`📊 Pacientes existentes: ${patientCount}`)

    if (patientCount > 0) {
      // Eliminar todas las citas relacionadas primero (por las foreign keys)
      console.log('🗑️ Eliminando citas relacionadas...')
      await connection.query('DELETE FROM appointments WHERE patient_id IN (SELECT id FROM patients)')
      
      // Eliminar todas las historias clínicas relacionadas
      console.log('🗑️ Eliminando historias clínicas relacionadas...')
      await connection.query('DELETE FROM medical_records WHERE patient_id IN (SELECT id FROM patients)')
      
      // Eliminar todos los consentimientos relacionados
      console.log('🗑️ Eliminando consentimientos relacionados...')
      await connection.query('DELETE FROM consents WHERE patient_id IN (SELECT id FROM patients)')
      
      // Eliminar todos los recordatorios relacionados
      console.log('🗑️ Eliminando recordatorios relacionados...')
      await connection.query('DELETE FROM reminders WHERE patient_id IN (SELECT id FROM patients)')
      
      // Eliminar todos los pacientes
      console.log('🗑️ Eliminando todos los pacientes...')
      await connection.query('DELETE FROM patients')
      
      console.log('✅ Base de datos de pacientes limpiada correctamente')
    } else {
      console.log('ℹ️ No hay pacientes para eliminar')
    }

    // Verificar que la tabla esté vacía
    const [finalCount] = await connection.query('SELECT COUNT(*) as count FROM patients')
    console.log(`📊 Pacientes restantes: ${finalCount[0].count}`)

    // Verificar la estructura de la tabla
    const [columns] = await connection.query(`
      SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'patients'
      ORDER BY ORDINAL_POSITION
    `, [dbConfig.database])
    
    console.log('\n📋 Estructura de la tabla patients:')
    columns.forEach(col => {
      console.log(`   - ${col.COLUMN_NAME}: ${col.DATA_TYPE} (${col.IS_NULLABLE === 'YES' ? 'NULL' : 'NOT NULL'})`)
    })

    console.log('\n🎉 Base de datos lista para crear pacientes nuevos!')
    console.log('💡 Ahora puedes probar el flujo de atención de citas')
    
  } catch (error) {
    console.error('❌ Error al limpiar la base de datos:', error.message)
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
  cleanPatientsDatabase()
}

module.exports = { cleanPatientsDatabase }
