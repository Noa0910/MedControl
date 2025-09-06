# 🚀 Configuración de XAMPP con MySQL para MedControl

## 📋 Pasos para configurar XAMPP

### 1. Instalar XAMPP
- Descarga XAMPP desde: https://www.apachefriends.org/
- Instala XAMPP en tu sistema
- Inicia XAMPP Control Panel

### 2. Configurar MySQL
1. En XAMPP Control Panel, inicia **Apache** y **MySQL**
2. Abre phpMyAdmin: http://localhost/phpmyadmin
3. Crea una nueva base de datos llamada `medcontrol`

### 3. Configurar Variables de Entorno
Crea un archivo `.env.local` en la raíz del proyecto con:

```env
# Configuración de MySQL (XAMPP)
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=medcontrol

# Configuración de la aplicación
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Inicializar la Base de Datos
```bash
npm run db:init
```

Este comando:
- Creará todas las tablas necesarias
- Insertará datos de prueba (3 doctores)
- Configurará la estructura de la base de datos

### 5. Iniciar la Aplicación
```bash
npm run dev
```

## 👨‍⚕️ Credenciales de Prueba

Después de ejecutar `npm run db:init`, tendrás estos doctores:

| Doctor | Email | Contraseña | Especialidad |
|--------|-------|------------|--------------|
| Dr. Carlos García | dr.garcia@medcontrol.com | 123456 | Cardiología |
| Dr. Ana López | dr.lopez@medcontrol.com | 123456 | Dermatología |
| Dra. María Hernández | dra.hernandez@medcontrol.com | 123456 | Pediatría |

## 🔧 Verificación

1. **Verificar MySQL**: http://localhost/phpmyadmin
2. **Verificar Aplicación**: http://localhost:3000
3. **Iniciar Sesión**: Usa las credenciales de arriba

## 🆘 Solución de Problemas

### Error de Conexión a MySQL
- Verifica que XAMPP esté ejecutándose
- Verifica que MySQL esté iniciado en XAMPP
- Verifica las credenciales en `.env.local`

### Puerto 3306 Ocupado
- Cambia el puerto en XAMPP si es necesario
- Actualiza `DB_PORT` en `.env.local`

### Base de Datos No Encontrada
- Ejecuta `npm run db:init` nuevamente
- Verifica que la base de datos `medcontrol` exista en phpMyAdmin

## 📊 Estructura de la Base de Datos

- **doctors**: Información de los médicos
- **patients**: Información de los pacientes
- **appointments**: Citas médicas
- **medical_records**: Historias clínicas
- **consents**: Consentimientos informados
- **reminders**: Recordatorios

Cada tabla está relacionada con `doctor_id` para separar los datos por especialista.



