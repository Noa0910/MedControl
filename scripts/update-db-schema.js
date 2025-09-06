const mysql = require('mysql2/promise')

// Configuración de la base de datos
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'medcontrol',
}

async function updateDatabaseSchema() {
  let connection
  
  try {
    console.log('🔄 Actualizando esquema de la base de datos...')
    
    // Conectar a la base de datos
    connection = await mysql.createConnection(dbConfig)
    console.log('✅ Conectado a la base de datos')

    // Verificar si los campos ya existen
    const [columns] = await connection.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'patients'
    `, [dbConfig.database])
    
    const existingColumns = columns.map(col => col.COLUMN_NAME)
    console.log('📋 Columnas existentes en patients:', existingColumns)

    // Agregar campos faltantes
    const fieldsToAdd = [
      { name: 'document_type', type: 'VARCHAR(50)', after: 'address' },
      { name: 'document_number', type: 'VARCHAR(50)', after: 'document_type' },
      { name: 'eps', type: 'VARCHAR(255)', after: 'document_number' },
      { name: 'marital_status', type: 'VARCHAR(50)', after: 'eps' },
      { name: 'occupation', type: 'VARCHAR(255)', after: 'marital_status' }
    ]

    for (const field of fieldsToAdd) {
      if (!existingColumns.includes(field.name)) {
        console.log(`➕ Agregando campo: ${field.name}`)
        await connection.query(`
          ALTER TABLE patients 
          ADD COLUMN ${field.name} ${field.type} 
          ${field.after ? `AFTER ${field.after}` : ''}
        `)
        console.log(`✅ Campo ${field.name} agregado correctamente`)
      } else {
        console.log(`ℹ️ Campo ${field.name} ya existe`)
      }
    }

    // Verificar la estructura final
    const [finalColumns] = await connection.query(`
      SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'patients'
      ORDER BY ORDINAL_POSITION
    `, [dbConfig.database])
    
    console.log('\n📊 Estructura final de la tabla patients:')
    finalColumns.forEach(col => {
      console.log(`   - ${col.COLUMN_NAME}: ${col.DATA_TYPE} (${col.IS_NULLABLE === 'YES' ? 'NULL' : 'NOT NULL'})`)
    })

    console.log('\n🎉 Esquema de base de datos actualizado correctamente!')
    
  } catch (error) {
    console.error('❌ Error al actualizar el esquema:', error.message)
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
  updateDatabaseSchema()
}

module.exports = { updateDatabaseSchema }
