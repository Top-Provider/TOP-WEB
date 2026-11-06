-- ==============================================================================
-- อัปเดต option_type ให้เป็น 'printer' และ 'supply'
-- ==============================================================================

-- 1. อัปเดตแถวข้อมูลเดิมที่มีอยู่แล้ว
UPDATE public."TBM_PROGRAM_OPTIONS"
SET option_type = 'printer', updated_at = timezone('utc'::text, now())
WHERE option_type = 'printer_category';

UPDATE public."TBM_PROGRAM_OPTIONS"
SET option_type = 'supply', updated_at = timezone('utc'::text, now())
WHERE option_type = 'supply_category';

-- 2. ข้อมูลตัวเลือก PRINTER (option_type = 'printer')
INSERT INTO public."TBM_PROGRAM_OPTIONS" (option_type, value, label, display_order, is_active)
VALUES
    ('printer', 'Black & White Laser Printer', 'Black & White Laser Printer', 1, true),
    ('printer', 'Color Laser Printer', 'Color Laser Printer', 2, true),
    ('printer', 'Inkjet Printer', 'Inkjet Printer', 3, true),
    ('printer', 'Large Format Printer', 'Large Format Printer', 4, true),
    ('printer', 'Thermal Printer', 'Thermal Printer', 5, true),
    ('printer', 'Thermal Wristband Printer', 'Thermal Wristband Printer', 6, true),
    ('printer', 'Dot Matrix Printer', 'Dot Matrix Printer', 7, true)
ON CONFLICT (option_type, value) DO UPDATE
SET label = EXCLUDED.label, 
    display_order = EXCLUDED.display_order, 
    updated_at = timezone('utc'::text, now());

-- 3. ข้อมูลตัวเลือก SUPPLY (option_type = 'supply')
INSERT INTO public."TBM_PROGRAM_OPTIONS" (option_type, value, label, display_order, is_active)
VALUES
    ('supply', 'Toner', 'Toner', 1, true),
    ('supply', 'Sticker', 'Sticker', 2, true),
    ('supply', 'Wristband', 'Wristband', 3, true),
    ('supply', 'Ribbon', 'Ribbon', 4, true),
    ('supply', 'Form', 'Form', 5, true)
ON CONFLICT (option_type, value) DO UPDATE
SET label = EXCLUDED.label, 
    display_order = EXCLUDED.display_order, 
    updated_at = timezone('utc'::text, now());
