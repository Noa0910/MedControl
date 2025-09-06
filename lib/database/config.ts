// Configuración de la base de datos
export const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'medcontrol',
}

// Instrucciones para configurar XAMPP y MySQL
export const setupInstructions = `
📋 INSTRUCCIONES PARA CONFIGURAR XAMPP CON MYSQL:

1. INSTALAR XAMPP:
   - Descarga XAMPP desde: https://www.apachefriends.org/
   - Instala XAMPP en tu sistema
   - Inicia XAMPP Control Panel

2. CONFIGURAR MYSQL:
   - En XAMPP Control Panel, inicia Apache y MySQL
   - Abre phpMyAdmin: http://localhost/phpmyadmin
   - Crea una nueva base de datos llamada "medcontrol"

3. CONFIGURAR VARIABLES DE ENTORNO:
   - Crea un archivo .env.local en la raíz del proyecto
   - Agrega las siguientes variables:
   
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=
   DB_NAME=medcontrol
   NEXT_PUBLIC_APP_URL=http://localhost:3000

4. INICIALIZAR LA BASE DE DATOS:
   - Ejecuta: npm run db:init
   - Esto creará las tablas y datos de prueba

5. VERIFICAR CONEXIÓN:
   - Ejecuta: npm run dev
   - El sistema se conectará automáticamente a MySQL
`



