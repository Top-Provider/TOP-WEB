-- ==============================================================================
-- 1. สร้างตารางรวมสินค้าจับต้องได้ทั้งหมด: TB_PRODUCTS (Hardware, Printer, Supply)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public."TB_PRODUCTS" (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    sku TEXT,
    slug TEXT,
    category_id TEXT DEFAULT 'Printing',
    sub_category TEXT,
    brand TEXT,
    product_type TEXT NOT NULL DEFAULT 'printer', -- 'printer', 'supply', 'hardware'
    short_description TEXT,
    full_description TEXT,
    specifications JSONB DEFAULT '[]'::jsonb,
    bullet_points TEXT[] DEFAULT '{}',
    cover_image_url TEXT,
    gallery_images TEXT[] DEFAULT '{}',
    compatible_products TEXT[] DEFAULT '{}',
    datasheet_en_url TEXT,
    tor_th_url TEXT,
    is_featured BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. เปิดใช้งาน RLS และนโยบายความปลอดภัย
ALTER TABLE public."TB_PRODUCTS" ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'TB_PRODUCTS' AND policyname = 'Allow public read TB_PRODUCTS'
    ) THEN
        CREATE POLICY "Allow public read TB_PRODUCTS" 
        ON public."TB_PRODUCTS" FOR SELECT USING (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'TB_PRODUCTS' AND policyname = 'Allow all write TB_PRODUCTS'
    ) THEN
        CREATE POLICY "Allow all write TB_PRODUCTS" 
        ON public."TB_PRODUCTS" FOR ALL USING (true) WITH CHECK (true);
    END IF;
END $$;

-- 3. คัดลอกข้อมูลเดิมจาก TB_PRODUCT_HARDWARE (ถ้ามี) เข้าตาราง TB_PRODUCTS
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'TB_PRODUCT_HARDWARE') THEN
        INSERT INTO public."TB_PRODUCTS" (
            name, sku, slug, category_id, sub_category, brand, product_type,
            short_description, full_description, specifications, bullet_points,
            cover_image_url, gallery_images, compatible_products, datasheet_en_url, tor_th_url, is_active
        )
        SELECT 
            name, sku, slug, COALESCE(category_id, 'Printing'), sub_category, brand, COALESCE(product_type, 'printer'),
            short_description, full_description, specifications, bullet_points,
            cover_image_url, gallery_images, compatible_products, datasheet_en_url, tor_th_url, is_active
        FROM public."TB_PRODUCT_HARDWARE"
        ON CONFLICT DO NOTHING;
    END IF;

    -- คัดลอกข้อมูลเดิมจาก TB_PRODUCT_SUPPLIES (ถ้ามี) เข้าตาราง TB_PRODUCTS
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'TB_PRODUCT_SUPPLIES') THEN
        INSERT INTO public."TB_PRODUCTS" (
            name, sku, slug, category_id, sub_category, brand, product_type,
            short_description, full_description, specifications, bullet_points,
            cover_image_url, gallery_images, compatible_products, datasheet_en_url, tor_th_url, is_active
        )
        SELECT 
            name, sku, slug, COALESCE(category_id, 'Printing'), sub_category, brand, 'supply',
            short_description, full_description, specifications, bullet_points,
            cover_image_url, gallery_images, compatible_products, datasheet_en_url, tor_th_url, is_active
        FROM public."TB_PRODUCT_SUPPLIES"
        ON CONFLICT DO NOTHING;
    END IF;
END $$;

