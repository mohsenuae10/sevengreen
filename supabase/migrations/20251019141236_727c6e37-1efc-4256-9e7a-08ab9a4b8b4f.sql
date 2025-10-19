-- تحديث المنتجات الحالية لاستخدام slug بدلاً من الاسم العربي
UPDATE products 
SET category = 'hair-care' 
WHERE category = 'العناية بالشعر';

UPDATE products 
SET category = 'skincare' 
WHERE category = 'العناية بالبشرة';

UPDATE products 
SET category = 'body-care' 
WHERE category = 'العناية بالجسم';

UPDATE products 
SET category = 'men-care' 
WHERE category = 'العناية بالرجال';

UPDATE products 
SET category = 'wellness' 
WHERE category = 'الصحة والعافية';

UPDATE products 
SET category = 'gifts' 
WHERE category = 'الهدايا والمجموعات';

-- إيقاف المنتجات في أقسام غير موجودة
UPDATE products 
SET is_active = false 
WHERE category NOT IN (
  SELECT slug FROM categories WHERE is_active = true
) AND category NOT IN ('hair-care', 'skincare', 'body-care', 'men-care', 'wellness', 'gifts');