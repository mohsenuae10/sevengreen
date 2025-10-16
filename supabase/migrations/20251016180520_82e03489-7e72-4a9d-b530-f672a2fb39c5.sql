-- تفعيل المنتج الرابع وتصحيح فئته
UPDATE products 
SET 
  category = 'العناية بالشعر',
  is_active = true
WHERE id = '499b5dc4-37ac-4e04-a8de-e1ddff76171a';

-- إزالة المسافات الزائدة من جميع الفئات في جدول المنتجات
UPDATE products 
SET category = TRIM(category)
WHERE category LIKE '% ' OR category LIKE ' %';