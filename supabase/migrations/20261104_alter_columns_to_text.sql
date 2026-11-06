-- ==============================================================================
-- Migration: ปลดล็อกข้อจำกัดความยาว VARCHAR(100) ให้เป็น TEXT ทั้งหมด
-- แก้ปัญหา: [saveRecord Error]: "value too long for type character varying(100)"
-- ==============================================================================

-- 1. สำหรับตาราง TB_PRODUCTS (พิมพ์ใหญ่)
ALTER TABLE IF EXISTS public."TB_PRODUCTS" 
    ALTER COLUMN name TYPE TEXT,
    ALTER COLUMN sku TYPE TEXT,
    ALTER COLUMN slug TYPE TEXT,
    ALTER COLUMN category_id TYPE TEXT,
    ALTER COLUMN sub_category TYPE TEXT,
    ALTER COLUMN brand TYPE TEXT,
    ALTER COLUMN product_type TYPE TEXT;

-- 2. สำหรับตาราง tb_products (พิมพ์เล็ก)
ALTER TABLE IF EXISTS public.tb_products 
    ALTER COLUMN name TYPE TEXT,
    ALTER COLUMN sku TYPE TEXT,
    ALTER COLUMN slug TYPE TEXT,
    ALTER COLUMN category_id TYPE TEXT,
    ALTER COLUMN sub_category TYPE TEXT,
    ALTER COLUMN brand TYPE TEXT,
    ALTER COLUMN product_type TYPE TEXT;

-- 3. ตารางตัวเลือก TBM_PROGRAM_OPTIONS / tbm_program_options
ALTER TABLE IF EXISTS public."TBM_PROGRAM_OPTIONS" 
    ALTER COLUMN option_type TYPE TEXT,
    ALTER COLUMN value TYPE TEXT,
    ALTER COLUMN label TYPE TEXT;

ALTER TABLE IF EXISTS public.tbm_program_options 
    ALTER COLUMN option_type TYPE TEXT,
    ALTER COLUMN value TYPE TEXT,
    ALTER COLUMN label TYPE TEXT;

-- 4. ตารางหมวดหมู่หลัก TBM_PRODUCT_CATEGORIES / tbm_product_categories
ALTER TABLE IF EXISTS public."TBM_PRODUCT_CATEGORIES" 
    ALTER COLUMN category_id TYPE TEXT,
    ALTER COLUMN name TYPE TEXT;

ALTER TABLE IF EXISTS public.tbm_product_categories 
    ALTER COLUMN category_id TYPE TEXT,
    ALTER COLUMN name TYPE TEXT;

-- 5. ตารางฮาร์ดแวร์เดิม (ถ้ามี)
ALTER TABLE IF EXISTS public."TB_PRODUCT_HARDWARE"
    ALTER COLUMN name TYPE TEXT,
    ALTER COLUMN sku TYPE TEXT,
    ALTER COLUMN slug TYPE TEXT,
    ALTER COLUMN category_id TYPE TEXT,
    ALTER COLUMN sub_category TYPE TEXT,
    ALTER COLUMN brand TYPE TEXT;

ALTER TABLE IF EXISTS public.tb_product_hardware
    ALTER COLUMN name TYPE TEXT,
    ALTER COLUMN sku TYPE TEXT,
    ALTER COLUMN slug TYPE TEXT,
    ALTER COLUMN category_id TYPE TEXT,
    ALTER COLUMN sub_category TYPE TEXT,
    ALTER COLUMN brand TYPE TEXT;

-- 6. ตารางวัสดุสิ้นเปลืองเดิม (ถ้ามี)
ALTER TABLE IF EXISTS public."TB_PRODUCT_SUPPLIES"
    ALTER COLUMN name TYPE TEXT,
    ALTER COLUMN sku TYPE TEXT,
    ALTER COLUMN slug TYPE TEXT,
    ALTER COLUMN category_id TYPE TEXT,
    ALTER COLUMN sub_category TYPE TEXT,
    ALTER COLUMN brand TYPE TEXT;

ALTER TABLE IF EXISTS public.tb_product_supplies
    ALTER COLUMN name TYPE TEXT,
    ALTER COLUMN sku TYPE TEXT,
    ALTER COLUMN slug TYPE TEXT,
    ALTER COLUMN category_id TYPE TEXT,
    ALTER COLUMN sub_category TYPE TEXT,
    ALTER COLUMN brand TYPE TEXT;
