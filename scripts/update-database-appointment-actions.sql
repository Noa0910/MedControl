-- Script para actualizar la base de datos con funcionalidades de gestión de citas

-- 1. Agregar columnas a la tabla appointments
ALTER TABLE appointments 
ADD COLUMN no_show_reason VARCHAR(500) NULL,
ADD COLUMN clinical_history JSON NULL,
ADD COLUMN notes TEXT NULL;

-- 2. Crear tabla de historias clínicas
CREATE TABLE IF NOT EXISTS clinical_history (
    id VARCHAR(36) PRIMARY KEY,
    patient_id VARCHAR(36) NOT NULL,
    doctor_id VARCHAR(36) NOT NULL,
    appointment_id VARCHAR(36) NULL,
    chief_complaint TEXT NOT NULL,
    current_illness TEXT NULL,
    medical_history TEXT NULL,
    surgical_history TEXT NULL,
    allergies TEXT NULL,
    medications TEXT NULL,
    vital_signs JSON NULL,
    cardiovascular_exam TEXT NULL,
    respiratory_exam TEXT NULL,
    neurological_exam TEXT NULL,
    gastrointestinal_exam TEXT NULL,
    genitourinary_exam TEXT NULL,
    musculoskeletal_exam TEXT NULL,
    dermatological_exam TEXT NULL,
    diagnosis TEXT NULL,
    treatment TEXT NULL,
    recommendations TEXT NULL,
    follow_up VARCHAR(500) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE,
    FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE SET NULL
);

-- 3. Crear tabla de pacientes por especialista (para el seguimiento)
CREATE TABLE IF NOT EXISTS specialist_patients (
    id VARCHAR(36) PRIMARY KEY,
    doctor_id VARCHAR(36) NOT NULL,
    patient_id VARCHAR(36) NOT NULL,
    first_consultation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_consultation_date TIMESTAMP NULL,
    total_consultations INT DEFAULT 1,
    status ENUM('active', 'inactive', 'discharged') DEFAULT 'active',
    notes TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    UNIQUE KEY unique_doctor_patient (doctor_id, patient_id)
);

-- 4. Crear tabla de notificaciones
CREATE TABLE IF NOT EXISTS notifications (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    user_type ENUM('doctor', 'patient') NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    type ENUM('info', 'success', 'warning', 'error') DEFAULT 'info',
    is_read BOOLEAN DEFAULT FALSE,
    appointment_id VARCHAR(36) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE CASCADE
);

-- 5. Crear índices para mejorar el rendimiento
CREATE INDEX idx_appointments_status ON appointments(status);
CREATE INDEX idx_appointments_date ON appointments(appointment_date);
CREATE INDEX idx_clinical_history_patient ON clinical_history(patient_id);
CREATE INDEX idx_clinical_history_doctor ON clinical_history(doctor_id);
CREATE INDEX idx_specialist_patients_doctor ON specialist_patients(doctor_id);
CREATE INDEX idx_notifications_user ON notifications(user_id, user_type);
CREATE INDEX idx_notifications_read ON notifications(is_read);

-- 6. Insertar datos de ejemplo para testing
INSERT INTO notifications (id, user_id, user_type, title, message, type) VALUES
('notif_1', 'admin@medcontrol.com', 'doctor', 'Sistema Actualizado', 'Se han implementado nuevas funcionalidades de gestión de citas', 'info'),
('notif_2', 'admin@medcontrol.com', 'doctor', 'Nueva Funcionalidad', 'Ahora puedes gestionar citas directamente desde el calendario', 'success');

-- 7. Crear vista para citas con información completa
CREATE OR REPLACE VIEW appointments_complete AS
SELECT 
    a.*,
    p.first_name as patient_first_name,
    p.last_name as patient_last_name,
    p.phone as patient_phone,
    p.email as patient_email,
    d.full_name as doctor_name,
    d.specialty as doctor_specialty,
    CASE 
        WHEN a.status = 'completed' THEN 'Completada'
        WHEN a.status = 'cancelled' THEN 'Cancelada'
        WHEN a.status = 'no_show' THEN 'No Asistió'
        WHEN a.status = 'confirmed' THEN 'Confirmada'
        WHEN a.status = 'scheduled' THEN 'Programada'
        ELSE a.status
    END as status_text
FROM appointments a
LEFT JOIN patients p ON a.patient_id = p.id
LEFT JOIN doctors d ON a.doctor_id = d.id;

-- 8. Crear vista para historias clínicas completas
CREATE OR REPLACE VIEW clinical_history_complete AS
SELECT 
    ch.*,
    p.first_name as patient_first_name,
    p.last_name as patient_last_name,
    p.phone as patient_phone,
    p.email as patient_email,
    d.full_name as doctor_name,
    d.specialty as doctor_specialty,
    a.appointment_date,
    a.appointment_time
FROM clinical_history ch
LEFT JOIN patients p ON ch.patient_id = p.id
LEFT JOIN doctors d ON ch.doctor_id = d.id
LEFT JOIN appointments a ON ch.appointment_id = a.id;

-- 9. Crear procedimiento para actualizar contador de consultas
DELIMITER //
CREATE PROCEDURE UpdateConsultationCount(IN p_doctor_id VARCHAR(36), IN p_patient_id VARCHAR(36))
BEGIN
    INSERT INTO specialist_patients (id, doctor_id, patient_id, last_consultation_date, total_consultations)
    VALUES (CONCAT('sp_', UNIX_TIMESTAMP(), '_', SUBSTRING(MD5(RAND()), 1, 8)), p_doctor_id, p_patient_id, NOW(), 1)
    ON DUPLICATE KEY UPDATE 
        last_consultation_date = NOW(),
        total_consultations = total_consultations + 1,
        status = 'active';
END //
DELIMITER ;

-- 10. Crear trigger para actualizar contador cuando se completa una cita
DELIMITER //
CREATE TRIGGER after_appointment_completed
AFTER UPDATE ON appointments
FOR EACH ROW
BEGIN
    IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
        CALL UpdateConsultationCount(NEW.doctor_id, NEW.patient_id);
    END IF;
END //
DELIMITER ;

-- Mensaje de confirmación
SELECT 'Base de datos actualizada exitosamente con funcionalidades de gestión de citas' as message;


