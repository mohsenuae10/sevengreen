-- Fix car accessories category slug to use English format
UPDATE categories 
SET slug = 'car-accessories' 
WHERE name_ar = 'اكسسوارات السيارة';

-- Update products to use the correct English slug
UPDATE products 
SET category = 'car-accessories' 
WHERE category LIKE '%اكسسوارات%السيارة%' OR category = 'اكسسوارات السيارة';