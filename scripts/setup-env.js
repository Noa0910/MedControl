const fs = require('fs')
const path = require('path')

// Configuración de variables de entorno
const envContent = `# Configuración de MySQL (XAMPP)
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=medcontrol

# Configuración de la aplicación
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Supabase (opcional - deshabilitado por ahora)
# NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
# NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
`

const envPath = path.join(__dirname, '..', '.env.local')

try {
  // Verificar si el archivo ya existe
  if (fs.existsSync(envPath)) {
    console.log('⚠️ El archivo .env.local ya existe')
    console.log('📝 Contenido actual:')
    console.log(fs.readFileSync(envPath, 'utf8'))
    console.log('\n¿Deseas sobrescribirlo? (y/n)')
  } else {
    // Crear el archivo .env.local
    fs.writeFileSync(envPath, envContent)
    console.log('✅ Archivo .env.local creado correctamente')
    console.log('📝 Contenido:')
    console.log(envContent)
  }
} catch (error) {
  console.error('❌ Error al crear .env.local:', error.message)
  console.log('\n🔧 Crea manualmente el archivo .env.local con el siguiente contenido:')
  console.log(envContent)
}



