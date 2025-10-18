-- Fix the slug for accessories category to use English format
UPDATE categories 
SET slug = 'accessories' 
WHERE name_ar LIKE '%اكسسوار%';

-- Update existing products to use the new slug
UPDATE products 
SET category = 'accessories' 
WHERE category LIKE '%اكسسوار%' OR category = 'الاكسسوارات-';