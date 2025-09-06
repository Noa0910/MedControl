# MedControl - Sistema de Gestión Médica

Sistema completo de agendamiento de citas, historia clínica y gestión médica desarrollado con Next.js 14.

## 🚀 Características

- 📅 **Agendamiento de Citas**: Sistema completo de programación de citas médicas
- 👥 **Gestión de Pacientes**: Registro y seguimiento de pacientes
- 📋 **Historia Clínica Digital**: Registros médicos digitales seguros
- 📝 **Consentimientos Informados**: Gestión de documentos legales
- 🔔 **Recordatorios**: Sistema de notificaciones automáticas
- 👨‍⚕️ **Multi-Especialista**: Cada doctor tiene su espacio independiente
- 🌐 **Agendamiento Público**: Los pacientes pueden agendar citas directamente
- 🗄️ **Base de Datos Híbrida**: MySQL (XAMPP) + localStorage como fallback

## 🛠️ Tecnologías

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS
- **Formularios**: React Hook Form + Zod
- **Notificaciones**: React Hot Toast
- **Base de Datos**: MySQL (XAMPP) + localStorage
- **Autenticación**: Sistema personalizado

## 📦 Instalación Rápida

### Opción 1: Con XAMPP (Recomendado)

1. **Instala XAMPP**:
   - Descarga desde: https://www.apachefriends.org/
   - Instala y ejecuta XAMPP
   - Inicia Apache y MySQL

2. **Configura el proyecto**:
   ```bash
   # Clona e instala dependencias
   git clone https://github.com/Noa0910/MedControl.git
   cd MedControl
   npm install
   
   # Configura variables de entorno
   npm run setup:env
   
   # Inicializa la base de datos
   npm run db:init
   
   # Inicia el servidor
   npm run dev
   ```

3. **Accede a la aplicación**:
   - Aplicación: http://localhost:3000
   - phpMyAdmin: http://localhost/phpmyadmin

### Opción 2: Solo localStorage (Demo)

Si no tienes XAMPP, el sistema funciona automáticamente con localStorage:

```bash
npm install
npm run dev
```

## 👨‍⚕️ Credenciales de Prueba

| Doctor | Email | Contraseña | Especialidad |
|--------|-------|------------|--------------|
| Dr. Carlos García | dr.garcia@medcontrol.com | 123456 | Cardiología |
| Dr. Ana López | dr.lopez@medcontrol.com | 123456 | Dermatología |
| Dra. María Hernández | dra.hernandez@medcontrol.com | 123456 | Pediatría |

## 🎯 Uso del Sistema

### Para Médicos
1. Inicia sesión con tus credenciales
2. Accede a tu dashboard personalizado
3. Gestiona pacientes, citas y historias clínicas
4. Cada especialista ve solo sus propios datos

### Para Pacientes
1. Visita: http://localhost:3000/agendar
2. Selecciona el especialista
3. Completa el formulario de cita
4. Recibe confirmación automática

## 📊 Indicador de Base de Datos

El sistema muestra en la esquina inferior derecha:
- 🟢 **MySQL**: Cuando XAMPP está ejecutándose
- 🟡 **LocalStorage**: Cuando MySQL no está disponible

## 🔧 Comandos Disponibles

```bash
npm run dev          # Inicia el servidor de desarrollo
npm run build        # Construye para producción
npm run start        # Inicia el servidor de producción
npm run db:init      # Inicializa la base de datos MySQL
npm run db:reset     # Reinicia la base de datos
npm run setup:env    # Configura variables de entorno
```

## 📁 Estructura del Proyecto

```
app/
├── dashboard/          # Panel de control para médicos
├── agendar/           # Páginas públicas de agendamiento
└── api/               # API routes

components/
├── auth/              # Componentes de autenticación
├── dashboard/         # Componentes del dashboard
├── patients/          # Gestión de pacientes
├── appointments/      # Gestión de citas
├── medical-records/   # Historias clínicas
├── consents/          # Consentimientos
├── reminders/         # Recordatorios
└── ui/                # Componentes de interfaz

lib/
├── database/          # Configuración de base de datos
├── local-storage.ts   # Utilidades de almacenamiento local
└── mock-data.ts       # Datos de prueba

scripts/
├── init-db.js         # Inicialización de MySQL
└── setup-env.js       # Configuración de variables
```

## 🆘 Solución de Problemas

### Error de Conexión a MySQL
- Verifica que XAMPP esté ejecutándose
- Verifica que MySQL esté iniciado
- Revisa las credenciales en `.env.local`

### Puerto 3000 Ocupado
```bash
# En Windows
taskkill /f /im node.exe

# En Mac/Linux
pkill -f node
```

### Base de Datos No Encontrada
```bash
npm run db:init
```

## 🔄 Modo Híbrido

El sistema funciona automáticamente en modo híbrido:
- **Con MySQL**: Si XAMPP está disponible
- **Con localStorage**: Si MySQL no está disponible

Esto permite desarrollo sin configuración compleja y producción con base de datos real.

## 📝 Licencia

Este proyecto está bajo la Licencia MIT.
