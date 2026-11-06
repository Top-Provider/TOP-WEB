-- ==============================================================================
-- เพิ่มข้อมูลตัวเลือกหมวดหมู่ย่อย NETWORK ลงใน TBM_PROGRAM_OPTIONS
-- ==============================================================================

INSERT INTO public."TBM_PROGRAM_OPTIONS" (option_type, value, label, display_order, is_active)
VALUES
    ('network', 'Server', 'Server', 1, true),
    ('network', 'Storage', 'Storage', 2, true),
    ('network', 'License', 'License', 3, true),
    ('network', 'Software Install Client', 'Software Install Client', 4, true)
ON CONFLICT (option_type, value) DO UPDATE
SET label = EXCLUDED.label, 
    display_order = EXCLUDED.display_order, 
    is_active = true,
    updated_at = timezone('utc'::text, now());

