-- إضافة حقول GTIN و MPN للمنتجات لتحسين SEO
ALTER TABLE products
ADD COLUMN IF NOT EXISTS gtin VARCHAR(50),
ADD COLUMN IF NOT EXISTS mpn VARCHAR(100);

COMMENT ON COLUMN products.gtin IS 'Global Trade Item Number - رقم المنتج العالمي';
COMMENT ON COLUMN products.mpn IS 'Manufacturer Part Number - رقم القطعة من الشركة المصنعة';