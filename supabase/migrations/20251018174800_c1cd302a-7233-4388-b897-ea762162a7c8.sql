-- Update all products to use the correct slug instead of Arabic category names
UPDATE products SET category = 'hair-care' WHERE category = 'العناية بالشعر';
UPDATE products SET category = 'skincare' WHERE category = 'العناية بالبشرة';
UPDATE products SET category = 'wellness' WHERE category = 'الصحة والعافية';
UPDATE products SET category = 'body-care' WHERE category = 'العناية بالجسم';
UPDATE products SET category = 'men-care' WHERE category = 'العناية بالرجال';
UPDATE products SET category = 'gifts' WHERE category = 'الهدايا والمجموعات';

-- Fix the home tools category slug
UPDATE categories SET slug = 'home-tools' WHERE name_ar LIKE '%الأدوات المنزلية%';
UPDATE products SET category = 'home-tools' WHERE category LIKE '%الأدوات المنزلية%';