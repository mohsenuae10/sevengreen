-- إنشاء جدول الأقسام
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_ar TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description_ar TEXT,
  banner_url TEXT,
  icon TEXT NOT NULL DEFAULT 'Sparkles',
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- تفعيل RLS
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- سياسة القراءة للجميع (الأقسام النشطة فقط في الواجهة الأمامية)
CREATE POLICY "الأقسام متاحة للقراءة للجميع"
ON public.categories
FOR SELECT
USING (true);

-- سياسة الإضافة للمسؤولين فقط
CREATE POLICY "المسؤولون فقط يمكنهم إضافة الأقسام"
ON public.categories
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- سياسة التعديل للمسؤولين فقط
CREATE POLICY "المسؤولون فقط يمكنهم تعديل الأقسام"
ON public.categories
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- سياسة الحذف للمسؤولين فقط
CREATE POLICY "المسؤولون فقط يمكنهم حذف الأقسام"
ON public.categories
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Trigger لتحديث updated_at
CREATE TRIGGER update_categories_updated_at
BEFORE UPDATE ON public.categories
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- إنشاء storage bucket لصور الأقسام
INSERT INTO storage.buckets (id, name, public)
VALUES ('category-banners', 'category-banners', true)
ON CONFLICT (id) DO NOTHING;

-- سياسات Storage للصور
CREATE POLICY "صور الأقسام متاحة للجميع"
ON storage.objects
FOR SELECT
USING (bucket_id = 'category-banners');

CREATE POLICY "المسؤولون فقط يمكنهم رفع صور الأقسام"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'category-banners' 
  AND (SELECT has_role(auth.uid(), 'admin'::app_role))
);

CREATE POLICY "المسؤولون فقط يمكنهم تحديث صور الأقسام"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'category-banners'
  AND (SELECT has_role(auth.uid(), 'admin'::app_role))
);

CREATE POLICY "المسؤولون فقط يمكنهم حذف صور الأقسام"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'category-banners'
  AND (SELECT has_role(auth.uid(), 'admin'::app_role))
);

-- إدخال الأقسام الحالية
INSERT INTO public.categories (name_ar, slug, description_ar, icon, display_order, is_active) VALUES
('العناية بالشعر', 'hair-care', 'اكتشف منتجات العناية بالشعر الطبيعية', 'Sparkles', 1, true),
('العناية بالبشرة', 'skincare', 'اكتشف منتجات العناية بالبشرة الطبيعية', 'Droplet', 2, true),
('الصحة والعافية', 'wellness', 'اكتشف منتجات الصحة والعافية الطبيعية', 'Heart', 3, true),
('العناية بالجسم', 'body-care', 'اكتشف منتجات العناية بالجسم الطبيعية', 'Flower2', 4, true),
('العناية بالرجال', 'men-care', 'اكتشف منتجات العناية بالرجال الطبيعية', 'User', 5, true),
('الهدايا والمجموعات', 'gifts', 'اكتشف الهدايا والمجموعات الطبيعية', 'Gift', 6, true)
ON CONFLICT (slug) DO NOTHING;