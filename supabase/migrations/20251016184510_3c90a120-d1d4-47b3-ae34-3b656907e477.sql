-- إضافة حقول جديدة لتفاصيل المنتج
ALTER TABLE products
ADD COLUMN IF NOT EXISTS ingredients_ar TEXT,
ADD COLUMN IF NOT EXISTS how_to_use_ar TEXT,
ADD COLUMN IF NOT EXISTS benefits_ar TEXT,
ADD COLUMN IF NOT EXISTS warnings_ar TEXT,
ADD COLUMN IF NOT EXISTS size_info TEXT,
ADD COLUMN IF NOT EXISTS made_in TEXT;

COMMENT ON COLUMN products.ingredients_ar IS 'المكونات بالعربية';
COMMENT ON COLUMN products.how_to_use_ar IS 'طريقة الاستخدام بالعربية';
COMMENT ON COLUMN products.benefits_ar IS 'الفوائد بالعربية';
COMMENT ON COLUMN products.warnings_ar IS 'التحذيرات بالعربية';
COMMENT ON COLUMN products.size_info IS 'معلومات الحجم';
COMMENT ON COLUMN products.made_in IS 'بلد المنشأ';