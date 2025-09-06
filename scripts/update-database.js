const mysql = require('mysql2/promise')
const fs = require('fs')
const path = require('path')

async function updateDatabase() {
  let connection
  
  try {
    // Conectar a la base de datos
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'medcontrol'
    })

    console.log('✅ Conectado a la base de datos MySQL')

    // Leer el archivo SQL
    const sqlFile = path.join(__dirname, 'update-database-appointment-actions.sql')
    const sqlContent = fs.readFileSync(sqlFile, 'utf8')

    // Dividir el contenido en declaraciones individuales
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'))

    console.log(`📝 Ejecutando ${statements.length} declaraciones SQL...`)

    // Ejecutar cada declaración
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i]
      
      if (statement.includes('DELIMITER')) {
        // Saltar declaraciones DELIMITER
        continue
      }

      try {
        await connection.execute(statement)
        console.log(`✅ Declaración ${i + 1} ejecutada correctamente`)
      } catch (error) {
        if (error.code === 'ER_TABLE_EXISTS' || 
            error.code === 'ER_DUP_KEYNAME' || 
            error.code === 'ER_DUP_ENTRY' ||
            error.message.includes('already exists')) {
          console.log(`⚠️  Declaración ${i + 1}: ${error.message}`)
        } else {
          console.error(`❌ Error en declaración ${i + 1}:`, error.message)
        }
      }
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

updateDatabase()


