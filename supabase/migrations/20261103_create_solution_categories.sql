-- ==============================================================================
-- 1. สร้างตารางกลุ่มโซลูชันหลัก (TBM_SOLUTION_DOMAINS)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public."TBM_SOLUTION_DOMAINS" (
    id SERIAL PRIMARY KEY,
    domain_code VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- 2. สร้างตารางหมวดหมู่โปรแกรม / โมดูลระบบงาน (TBM_SOFTWARE_CATEGORIES)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public."TBM_SOFTWARE_CATEGORIES" (
    id SERIAL PRIMARY KEY,
    category_code VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    domain_code VARCHAR(100) REFERENCES public."TBM_SOLUTION_DOMAINS"(domain_code) ON UPDATE CASCADE ON DELETE SET NULL,
    description TEXT,
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- เปิด RLS (Row Level Security)
ALTER TABLE public."TBM_SOLUTION_DOMAINS" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."TBM_SOFTWARE_CATEGORIES" ENABLE ROW LEVEL SECURITY;

-- สร้าง Policy สำหรับอ่านข้อมูลได้ทุกคน (Public Read)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'TBM_SOLUTION_DOMAINS' AND policyname = 'Allow public read TBM_SOLUTION_DOMAINS'
    ) THEN
        CREATE POLICY "Allow public read TBM_SOLUTION_DOMAINS" 
        ON public."TBM_SOLUTION_DOMAINS" FOR SELECT USING (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'TBM_SOFTWARE_CATEGORIES' AND policyname = 'Allow public read TBM_SOFTWARE_CATEGORIES'
    ) THEN
        CREATE POLICY "Allow public read TBM_SOFTWARE_CATEGORIES" 
        ON public."TBM_SOFTWARE_CATEGORIES" FOR SELECT USING (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'TBM_SOLUTION_DOMAINS' AND policyname = 'Allow all write TBM_SOLUTION_DOMAINS'
    ) THEN
        CREATE POLICY "Allow all write TBM_SOLUTION_DOMAINS" 
        ON public."TBM_SOLUTION_DOMAINS" FOR ALL USING (true) WITH CHECK (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'TBM_SOFTWARE_CATEGORIES' AND policyname = 'Allow all write TBM_SOFTWARE_CATEGORIES'
    ) THEN
        CREATE POLICY "Allow all write TBM_SOFTWARE_CATEGORIES" 
        ON public."TBM_SOFTWARE_CATEGORIES" FOR ALL USING (true) WITH CHECK (true);
    END IF;
END $$;

-- ==============================================================================
-- 3. เพิ่มข้อมูลเริ่มต้น (INSERT SEED DATA)
-- ==============================================================================

-- 3.1 เพิ่มข้อมูลกลุ่มโซลูชันหลัก (Solution Domains)
INSERT INTO public."TBM_SOLUTION_DOMAINS" (domain_code, name, description, display_order, is_active)
VALUES
    ('Healthcare Solution', 'Healthcare Solution', 'โซลูชันสารสนเทศทางการแพทย์และสาธารณสุขครบวงจร', 1, true),
    ('Paperless Solution', 'Paperless Solution', 'โซลูชันระบบการทำงานและจัดการเอกสารอิเล็กทรอนิกส์ไร้กระดาษ', 2, true),
    ('E-Learning Platform', 'E-Learning Platform', 'แพลตฟอร์มการเรียนรู้ การฝึกอบรม และพัฒนาบุคลากรออนไลน์', 3, true),
    ('Disaster & Incident CMS', 'Disaster & Incident CMS', 'ระบบศูนย์สั่งการและบริหารจัดการเหตุฉุกเฉิน/สาธารณภัย', 4, true),
    ('Enterprise Portal', 'Enterprise Portal', 'พอร์ทัลกลางเชื่อมโยงระบบงานและการให้บริการระดับองค์กร', 5, true)
ON CONFLICT (domain_code) DO UPDATE
SET name = EXCLUDED.name,
    description = EXCLUDED.description,
    display_order = EXCLUDED.display_order,
    updated_at = timezone('utc'::text, now());

-- 3.2 เพิ่มข้อมูลหมวดหมู่โปรแกรม / โมดูลระบบ (Software Categories)
INSERT INTO public."TBM_SOFTWARE_CATEGORIES" (category_code, name, domain_code, description, display_order, is_active)
VALUES
    ('Hospital Claim', 'Hospital Claim', 'Healthcare Solution', 'ระบบบริหารและเบิกจ่ายค่ารักษาพยาบาลอัจฉริยะ (e-Claim)', 1, true),
    ('Smart IPD', 'Smart IPD', 'Healthcare Solution', 'ระบบบริหารจัดการและดูแลผู้ป่วยในแบบดิจิทัล', 2, true),
    ('Smart Hospital', 'Smart Hospital', 'Healthcare Solution', 'ระบบบริหารจัดการโรงพยาบาลอัจฉริยะครบวงจร (HIS)', 3, true),
    ('Public Health CMS', 'Public Health CMS', 'Healthcare Solution', 'ระบบสารสนเทศสุขภาพชุมชนและการจัดการงานสาธารณสุข', 4, true),
    ('Pharmacy & Stock', 'Pharmacy & Stock', 'Healthcare Solution', 'ระบบคลังยา เวชภัณฑ์ และการจัดการสต็อกโรงพยาบาล', 5, true),
    ('Queue & Triage', 'Queue & Triage', 'Healthcare Solution', 'ระบบจัดคิวอัตโนมัติและคัดกรองผู้ป่วยอัจฉริยะ', 6, true),
    ('Medical Record (EMR)', 'Medical Record (EMR)', 'Healthcare Solution', 'ระบบเวชระเบียนอิเล็กทรอนิกส์และประวัติการรักษา', 7, true),
    ('Telemedicine', 'Telemedicine', 'Healthcare Solution', 'ระบบบริการแพทย์ทางไกลและการปรึกษาแพทย์ออนไลน์', 8, true),
    ('Financial & Billing', 'Financial & Billing', 'Healthcare Solution', 'ระบบการเงิน บัญชี และคิดค่าบริการผู้ป่วย', 9, true)
ON CONFLICT (category_code) DO UPDATE
SET name = EXCLUDED.name,
    domain_code = EXCLUDED.domain_code,
    description = EXCLUDED.description,
    display_order = EXCLUDED.display_order,
    updated_at = timezone('utc'::text, now());

