# Schema Draft
- **users:** id, email, role
- **products:** id, name, model, price
- **devices:** id, device_uuid, product_id, owner_id (Digital Twin)
- **telemetry_logs:** id, device_uuid, water_level, voltage, motor_status, power_kw
- **alerts:** id, device_uuid, message, severity
