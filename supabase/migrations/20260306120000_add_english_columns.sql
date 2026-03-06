-- Add English language columns to products table
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS name_en TEXT,
  ADD COLUMN IF NOT EXISTS description_en TEXT,
  ADD COLUMN IF NOT EXISTS long_description_en TEXT,
  ADD COLUMN IF NOT EXISTS ingredients_en TEXT,
  ADD COLUMN IF NOT EXISTS how_to_use_en TEXT,
  ADD COLUMN IF NOT EXISTS benefits_en TEXT,
  ADD COLUMN IF NOT EXISTS warnings_en TEXT,
  ADD COLUMN IF NOT EXISTS category_en TEXT,
  ADD COLUMN IF NOT EXISTS seo_title_en TEXT,
  ADD COLUMN IF NOT EXISTS seo_description_en TEXT,
  ADD COLUMN IF NOT EXISTS seo_keywords_en TEXT;

-- Add English language columns to categories table
ALTER TABLE categories
  ADD COLUMN IF NOT EXISTS name_en TEXT;

-- Add English language columns to blog_posts table  
ALTER TABLE blog_posts
  ADD COLUMN IF NOT EXISTS title_en TEXT,
  ADD COLUMN IF NOT EXISTS content_en TEXT,
  ADD COLUMN IF NOT EXISTS excerpt_en TEXT,
  ADD COLUMN IF NOT EXISTS seo_title_en TEXT,
  ADD COLUMN IF NOT EXISTS seo_description_en TEXT;

-- Comment for documentation
COMMENT ON COLUMN products.name_en IS 'Product name in English';
COMMENT ON COLUMN products.description_en IS 'Product description in English';
COMMENT ON COLUMN products.long_description_en IS 'Long product description in English';
COMMENT ON COLUMN products.ingredients_en IS 'Product ingredients in English';
COMMENT ON COLUMN products.how_to_use_en IS 'Usage instructions in English';
COMMENT ON COLUMN products.benefits_en IS 'Product benefits in English';
COMMENT ON COLUMN products.warnings_en IS 'Product warnings in English';
COMMENT ON COLUMN products.category_en IS 'Product category name in English';
COMMENT ON COLUMN categories.name_en IS 'Category name in English';
