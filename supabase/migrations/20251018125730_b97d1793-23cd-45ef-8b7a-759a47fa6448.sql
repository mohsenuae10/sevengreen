-- إضافة عمود slug إلى جدول products
ALTER TABLE products 
ADD COLUMN slug TEXT;

-- إنشاء فهرس فريد للـ slug
CREATE UNIQUE INDEX products_slug_idx ON products(slug) 
WHERE slug IS NOT NULL;

-- دالة لتوليد slug تلقائياً من اسم المنتج
CREATE OR REPLACE FUNCTION generate_slug(text_input TEXT) 
RETURNS TEXT AS $$
DECLARE
  slug TEXT;
BEGIN
  -- تحويل إلى أحرف صغيرة وإزالة المسافات الزائدة
  slug := LOWER(TRIM(text_input));
  
  -- استبدال المسافات بـ -
  slug := REPLACE(slug, ' ', '-');
  
  -- إزالة الأحرف الخاصة (الإبقاء على العربية والإنجليزية والأرقام والشرطات)
  slug := REGEXP_REPLACE(slug, '[^a-z0-9\u0621-\u064A\-]', '', 'g');
  
  -- إزالة الشرطات المتعددة
  slug := REGEXP_REPLACE(slug, '-+', '-', 'g');
  
  -- إزالة الشرطات من البداية والنهاية
  slug := TRIM(BOTH '-' FROM slug);
  
  RETURN slug;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Trigger لتوليد slug تلقائياً عند الإضافة/التعديل
CREATE OR REPLACE FUNCTION auto_generate_slug()
RETURNS TRIGGER AS $$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER := 1;
BEGIN
  -- إذا كان الـ slug فارغاً، نولده من الاسم
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    base_slug := generate_slug(NEW.name_ar);
    final_slug := base_slug;
    
    -- التحقق من التكرار وإضافة رقم إذا لزم الأمر
    WHILE EXISTS (
      SELECT 1 FROM products 
      WHERE slug = final_slug 
      AND id != NEW.id
    ) LOOP
      final_slug := base_slug || '-' || counter;
      counter := counter + 1;
    END LOOP;
    
    NEW.slug := final_slug;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- إنشاء Trigger
DROP TRIGGER IF EXISTS products_auto_slug ON products;
CREATE TRIGGER products_auto_slug
  BEFORE INSERT OR UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION auto_generate_slug();

-- توليد slug للمنتجات الحالية
UPDATE products 
SET slug = generate_slug(name_ar) 
WHERE slug IS NULL;

-- تحديث الـ slugs المكررة
DO $$
DECLARE
  product_record RECORD;
  new_slug TEXT;
  counter INTEGER;
BEGIN
  FOR product_record IN 
    SELECT id, name_ar, slug
    FROM products
    WHERE slug IN (
      SELECT slug 
      FROM products 
      GROUP BY slug 
      HAVING COUNT(*) > 1
    )
    ORDER BY created_at
  LOOP
    counter := 1;
    new_slug := generate_slug(product_record.name_ar) || '-' || counter;
    
    WHILE EXISTS (
      SELECT 1 FROM products 
      WHERE slug = new_slug 
      AND id != product_record.id
    ) LOOP
      counter := counter + 1;
      new_slug := generate_slug(product_record.name_ar) || '-' || counter;
    END LOOP;
    
    UPDATE products 
    SET slug = new_slug 
    WHERE id = product_record.id;
  END LOOP;
END $$;