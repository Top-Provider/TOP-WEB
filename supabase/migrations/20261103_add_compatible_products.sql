-- ==============================================================================
-- เพิ่มคอลัมน์ compatible_products ในตารางฮาร์ดแวร์และหมึกพิมพ์
-- ==============================================================================
ALTER TABLE IF EXISTS public."TBM_PRODUCT_HARDWARE" 
ADD COLUMN IF NOT EXISTS compatible_products text[] DEFAULT '{}';

ALTER TABLE IF EXISTS public."TBM_PRODUCT_SUPPLIES" 
ADD COLUMN IF NOT EXISTS compatible_products text[] DEFAULT '{}';

-- อัปเดตข้อมูลจาก bullet_points มาใส่ compatible_products (ถ้ามี)
UPDATE public."TBM_PRODUCT_HARDWARE"
SET compatible_products = bullet_points
WHERE (compatible_products IS NULL OR compatible_products = '{}') 
  AND bullet_points IS NOT NULL AND bullet_points <> '{}';

UPDATE public."TBM_PRODUCT_SUPPLIES"
SET compatible_products = bullet_points
WHERE (compatible_products IS NULL OR compatible_products = '{}') 
  AND bullet_points IS NOT NULL AND bullet_points <> '{}';

