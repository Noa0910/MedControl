# 📧 Sistema de Correos para MedControl

## ✅ Funcionalidades Implementadas

### 1. Servicio de Correo (`lib/email/email-service.ts`)
- ✅ Envío de correos de confirmación de citas
- ✅ Envío de recordatorios de citas
- ✅ Plantillas HTML profesionales y responsivas
- ✅ Configuración SMTP flexible

### 2. Integración con Agendamiento
- ✅ Envío automático de correo al crear citas
- ✅ Obtención automática de datos del paciente y doctor
- ✅ Envío asíncrono (no bloquea la creación de citas)

### 3. Endpoints de Prueba
- ✅ `/api/email/demo` - Modo demo (sin envío real)
- ✅ `/api/email/test` - Envío real (requiere SMTP configurado)

### 4. Página de Prueba
- ✅ `/test-booking` - Interfaz completa para probar el agendamiento

## 🔧 Configuración para Envío Real

### 1. Configurar Variables de Entorno
Edita el archivo `.env.local` y agrega tus credenciales SMTP:

```env
# Email Configuration (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu-email@gmail.com
SMTP_PASS=tu-password-de-aplicacion
```

### 2. Configurar Gmail (Recomendado)

#### Opción A: Contraseña de Aplicación
1. Activa la verificación en 2 pasos en tu cuenta de Gmail
2. Ve a "Seguridad" > "Contraseñas de aplicaciones"
3. Genera una contraseña específica para MedControl
4. Usa esa contraseña en `SMTP_PASS`

#### Opción B: OAuth2 (Más Seguro)
Para producción, considera usar OAuth2 en lugar de contraseñas de aplicación.

### 3. Otros Proveedores SMTP

#### Outlook/Hotmail
```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_USER=tu-email@outlook.com
SMTP_PASS=tu-password
```

#### SendGrid
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=tu-sendgrid-api-key
```

#### Mailgun
```env
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_USER=tu-mailgun-smtp-user
SMTP_PASS=tu-mailgun-smtp-password
```

## 🧪 Cómo Probar

### 1. Modo Demo (Sin Configuración)
1. Ve a `http://localhost:3000/test-booking`
2. Completa el formulario
3. Haz clic en "Agendar Cita y Enviar Correo"
4. Verás la confirmación y logs en la consola del servidor

### 2. Modo Real (Con SMTP Configurado)
1. Configura las variables de entorno
2. Reinicia el servidor: `npm run dev`
3. Ve a `http://localhost:3000/test-booking`
4. Completa el formulario
5. El correo se enviará realmente al email especificado

### 3. Probar desde la API
```bash
# Modo demo
curl -X POST http://localhost:3000/api/email/demo \
  -H "Content-Type: application/json" \
  -d '{"patientEmail":"test@example.com","patientName":"Juan Pérez"}'

# Modo real (requiere SMTP configurado)
curl -X POST http://localhost:3000/api/email/test \
  -H "Content-Type: application/json" \
  -d '{"patientEmail":"test@example.com","patientName":"Juan Pérez"}'
```

## 📋 Características del Correo

### Plantilla de Confirmación
- ✅ Diseño profesional y responsivo
- ✅ Información completa de la cita
- ✅ Datos del paciente y doctor
- ✅ Información del consultorio
- ✅ Instrucciones importantes
- ✅ Branding de MedControl

### Información Incluida
- 👤 Nombre del paciente
- 👨‍⚕️ Nombre y especialidad del doctor
- 📅 Fecha y hora de la cita
- 📝 Motivo de la consulta
- 📄 Descripción adicional (si existe)
- 🏥 Información del consultorio
- ⚠️ Instrucciones importantes

## 🔄 Flujo Completo

1. **Paciente agenda cita** → Formulario de agendamiento
2. **Sistema crea cita** → Base de datos MySQL
3. **Sistema obtiene datos** → Paciente y doctor
4. **Sistema envía correo** → Confirmación automática
5. **Paciente recibe correo** → Con todos los detalles

## 🚀 Próximos Pasos

### Para Producción
1. ✅ Configurar SMTP real
2. ⏳ Implementar manejo de errores robusto
3. ⏳ Agregar logs de correos enviados
4. ⏳ Implementar cola de correos para alta demanda
5. ⏳ Agregar plantillas personalizables

### Funcionalidades Adicionales
- ⏳ Recordatorios automáticos (24h antes)
- ⏳ Cancelación de citas por correo
- ⏳ Reprogramación de citas
- ⏳ Encuestas de satisfacción
- ⏳ Notificaciones SMS

## 🐛 Solución de Problemas

### Error: "Invalid login"
- Verifica las credenciales SMTP
- Asegúrate de usar contraseña de aplicación para Gmail

### Error: "Connection timeout"
- Verifica el host y puerto SMTP
- Revisa la configuración de firewall

### Error: "Authentication failed"
- Verifica el usuario y contraseña
- Para Gmail, asegúrate de tener 2FA activado

### Correos no llegan
- Revisa la carpeta de spam
- Verifica que el email de destino sea válido
- Revisa los logs del servidor para errores

## 📞 Soporte

Si tienes problemas con la configuración de correos, revisa:
1. Los logs del servidor (`npm run dev`)
2. Las variables de entorno en `.env.local`
3. La configuración de tu proveedor SMTP
4. Los logs de la consola del navegador


