-- ==============================================================================
-- เพิ่มข้อมูลตัวเลือกหมวดหมู่ย่อย HARDWARE ลงใน TBM_PROGRAM_OPTIONS
-- ==============================================================================

INSERT INTO public."TBM_PROGRAM_OPTIONS" (option_type, value, label, display_order, is_active)
VALUES
    ('hardware', 'Handheld Barcode Scanner', 'Handheld Barcode Scanner', 1, true),
    ('hardware', 'Barcode Scanner', 'Barcode Scanner', 2, true),
    ('hardware', 'Scanner', 'Scanner', 3, true),
    ('hardware', 'UPS', 'UPS', 4, true),
    ('hardware', 'Computer', 'Computer', 5, true),
    ('hardware', 'Display', 'Display', 6, true),
    ('hardware', 'Projector', 'Projector', 7, true),
    ('hardware', 'Camera', 'Camera', 8, true),
    ('hardware', 'Mobile', 'Mobile', 9, true)
ON CONFLICT (option_type, value) DO UPDATE
SET label = EXCLUDED.label, 
    display_order = EXCLUDED.display_order, 
    is_active = true,
    updated_at = timezone('utc'::text, now());

