-- إنشاء جدول لتخزين الصور المتعددة للمنتج
CREATE TABLE product_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- فهرس لتحسين الأداء
CREATE INDEX idx_product_images_product_id ON product_images(product_id);
CREATE INDEX idx_product_images_display_order ON product_images(product_id, display_order);

-- تفعيل Row Level Security
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;

-- يمكن للجميع قراءة الصور
CREATE POLICY "الصور متاحة للقراءة للجميع"
ON product_images FOR SELECT
USING (true);

-- المسؤولون فقط يمكنهم إضافة الصور
CREATE POLICY "المسؤولون فقط يمكنهم إضافة الصور"
ON product_images FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- المسؤولون فقط يمكنهم تحديث الصور
CREATE POLICY "المسؤولون فقط يمكنهم تحديث الصور"
ON product_images FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- المسؤولون فقط يمكنهم حذف الصور
CREATE POLICY "المسؤولون فقط يمكنهم حذف الصور"
ON product_images FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- نقل الصور الموجودة من products.image_url إلى product_images
INSERT INTO product_images (product_id, image_url, display_order, is_primary)
SELECT id, image_url, 0, true
FROM products
WHERE image_url IS NOT NULL;