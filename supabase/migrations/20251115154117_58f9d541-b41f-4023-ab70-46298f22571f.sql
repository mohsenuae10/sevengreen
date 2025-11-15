-- إضافة عمود category_ar للمنتجات
ALTER TABLE products ADD COLUMN IF NOT EXISTS category_ar TEXT;

-- تحديث القيم الحالية بالعربية
UPDATE products SET category_ar = 'العناية بالشعر' WHERE category = 'hair-care';
UPDATE products SET category_ar = 'العناية بالبشرة' WHERE category = 'skincare';
UPDATE products SET category_ar = 'العناية بالجسم' WHERE category = 'body-care';
UPDATE products SET category_ar = 'العناية بالرجال' WHERE category = 'men-care';
UPDATE products SET category_ar = 'الصحة والعافية' WHERE category = 'wellness';
UPDATE products SET category_ar = 'الهدايا' WHERE category = 'gifts';

-- إضافة comment للتوضيح
COMMENT ON COLUMN products.category_ar IS 'Category name in Arabic for SEO and display purposes';