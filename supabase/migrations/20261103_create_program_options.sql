-- ==============================================================================
-- สร้างตารางตัวเลือกหมวดหมู่และโซลูชันสำหรับระบบโปรแกรม (TBM_PROGRAM_OPTIONS)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public."TBM_PROGRAM_OPTIONS" (
    id SERIAL PRIMARY KEY,
    option_type VARCHAR(50) NOT NULL, -- 'solution_group' หรือ 'program_category'
    value VARCHAR(100) NOT NULL,
    label VARCHAR(255) NOT NULL,
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT uq_program_option_type_value UNIQUE (option_type, value)
);

-- ปลดล็อก Unique ของ program_code ใน TBM_PRODUCT_SOFTWARE เผื่อไว้
ALTER TABLE "TBM_PRODUCT_SOFTWARE" DROP CONSTRAINT IF EXISTS "tbm_product_programs_program_code_key";

-- เปิด RLS และสร้าง Policy
ALTER TABLE public."TBM_PROGRAM_OPTIONS" ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'TBM_PROGRAM_OPTIONS' AND policyname = 'Allow public read TBM_PROGRAM_OPTIONS'
    ) THEN
        CREATE POLICY "Allow public read TBM_PROGRAM_OPTIONS" 
        ON public."TBM_PROGRAM_OPTIONS" FOR SELECT USING (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'TBM_PROGRAM_OPTIONS' AND policyname = 'Allow all write TBM_PROGRAM_OPTIONS'
    ) THEN
        CREATE POLICY "Allow all write TBM_PROGRAM_OPTIONS" 
        ON public."TBM_PROGRAM_OPTIONS" FOR ALL USING (true) WITH CHECK (true);
    END IF;
END $$;

-- 1. เพิ่มข้อมูลตัวเลือก Solution Groups (SOLUTION_GROUP_OPTIONS)
INSERT INTO public."TBM_PROGRAM_OPTIONS" (option_type, value, label, display_order, is_active)
VALUES
    ('solution_group', 'Healthcare Solution', 'Healthcare Solution (โซลูชันทางการแพทย์และสาธารณสุข)', 1, true),
    ('solution_group', 'Paperless Solution', 'Paperless Solution (โซลูชันระบบองค์กรไร้กระดาษ)', 2, true),
    ('solution_group', 'E-Learning Platform', 'E-Learning Platform (แพลตฟอร์มการเรียนรู้ออนไลน์)', 3, true),
    ('solution_group', 'Disaster & Incident CMS', 'Disaster & Incident CMS (ระบบจัดการเหตุฉุกเฉินและสาธารณภัย)', 4, true),
    ('solution_group', 'Enterprise Portal', 'Enterprise Portal (พอร์ทัลบริการข้อมูลองค์กร)', 5, true)
ON CONFLICT (option_type, value) DO UPDATE
SET label = EXCLUDED.label, 
    display_order = EXCLUDED.display_order, 
    updated_at = timezone('utc'::text, now());

-- 2. เพิ่มข้อมูลตัวเลือก Program Categories (PROGRAM_CATEGORY_OPTIONS)
INSERT INTO public."TBM_PROGRAM_OPTIONS" (option_type, value, label, display_order, is_active)
VALUES
    ('program_category', 'Hospital Claim', 'Hospital Claim (ระบบบริหารและเบิกจ่ายค่ารักษา)', 1, true),
    ('program_category', 'Smart IPD', 'Smart IPD (ระบบบริหารจัดการผู้ป่วยในอัจฉริยะ)', 2, true),
    ('program_category', 'Smart Hospital', 'Smart Hospital (ระบบบริหารโรงพยาบาลอัจฉริยะ)', 3, true),
    ('program_category', 'Public Health CMS', 'Public Health CMS (ระบบสารสนเทศสุขภาพชุมชน/สาธารณสุข)', 4, true),
    ('program_category', 'Hospital HIS', 'Hospital HIS (โปรแกรมบริหารจัดการโรงพยาบาลครบวงจร)', 5, true),
    ('program_category', 'Pharmacy & Stock', 'Pharmacy & Stock (คลังยาและเวชภัณฑ์)', 6, true),
    ('program_category', 'Queue & Triage', 'Queue & Triage (คัดกรองและคิวอัตโนมัติ)', 7, true),
    ('program_category', 'Medical Record (EMR)', 'Medical Record / EMR (เวชระเบียน)', 8, true),
    ('program_category', 'Telemedicine', 'Telemedicine (การแพทย์ทางไกล)', 9, true),
    ('program_category', 'Financial & Billing', 'Financial & Billing (การเงินและบัญชี)', 10, true)
ON CONFLICT (option_type, value) DO UPDATE
SET label = EXCLUDED.label, 
    display_order = EXCLUDED.display_order, 
    updated_at = timezone('utc'::text, now());

