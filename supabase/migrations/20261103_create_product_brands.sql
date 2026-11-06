-- ==============================================================================
-- สร้างตารางแบรนด์สินค้า (TBM_PRODUCT_BRANDS)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public."TBM_PRODUCT_BRANDS" (
    id SERIAL PRIMARY KEY,
    value VARCHAR(100) NOT NULL UNIQUE,
    label VARCHAR(100) NOT NULL,
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- เปิด RLS และสร้าง Policy
ALTER TABLE public."TBM_PRODUCT_BRANDS" ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'TBM_PRODUCT_BRANDS' AND policyname = 'Allow public read TBM_PRODUCT_BRANDS'
    ) THEN
        CREATE POLICY "Allow public read TBM_PRODUCT_BRANDS" 
        ON public."TBM_PRODUCT_BRANDS" FOR SELECT USING (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'TBM_PRODUCT_BRANDS' AND policyname = 'Allow all write TBM_PRODUCT_BRANDS'
    ) THEN
        CREATE POLICY "Allow all write TBM_PRODUCT_BRANDS" 
        ON public."TBM_PRODUCT_BRANDS" FOR ALL USING (true) WITH CHECK (true);
    END IF;
END $$;

-- เพิ่มข้อมูลตัวเลือกแบรนด์สินค้า (BRAND_OPTIONS)
INSERT INTO public."TBM_PRODUCT_BRANDS" (value, label, display_order, is_active)
VALUES
    ('Canon', 'Canon', 1, true),
    ('HP', 'HP', 2, true),
    ('Epson', 'Epson', 3, true),
    ('Brother', 'Brother', 4, true),
    ('Zebra', 'Zebra', 5, true),
    ('TSC', 'TSC', 6, true),
    ('Bixolon', 'Bixolon', 7, true),
    ('Ricoh', 'Ricoh', 8, true),
    ('Fujifilm', 'Fujifilm', 9, true),
    ('Kyocera', 'Kyocera', 10, true),
    ('Other', 'อื่นๆ (กำหนดเอง)', 99, true)
ON CONFLICT (value) DO UPDATE
SET label = EXCLUDED.label, 
    display_order = EXCLUDED.display_order, 
    updated_at = timezone('utc'::text, now());

