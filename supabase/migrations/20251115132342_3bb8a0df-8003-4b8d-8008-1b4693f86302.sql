-- ===================================
-- المرحلة 1: إنشاء نظام المراجعات الكامل
-- ===================================

-- جدول المراجعات
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  customer_name TEXT NOT NULL,
  customer_email TEXT,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  is_verified BOOLEAN DEFAULT false,
  is_approved BOOLEAN DEFAULT false,
  helpful_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Index لتسريع الاستعلامات
CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON public.reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_approved ON public.reviews(is_approved) WHERE is_approved = true;
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON public.reviews(created_at DESC);

-- RLS للمراجعات
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- المراجعات المعتمدة متاحة للقراءة للجميع
CREATE POLICY "المراجعات المعتمدة متاحة للجميع"
ON public.reviews
FOR SELECT
USING (is_approved = true);

-- الجميع يمكنهم إضافة مراجعة
CREATE POLICY "الجميع يمكنهم إضافة مراجعات"
ON public.reviews
FOR INSERT
WITH CHECK (true);

-- المسؤولون فقط يمكنهم تعديل المراجعات
CREATE POLICY "المسؤولون يديرون المراجعات"
ON public.reviews
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- المسؤولون فقط يمكنهم حذف المراجعات
CREATE POLICY "المسؤولون يحذفون المراجعات"
ON public.reviews
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- ===================================
-- تحسين محتوى المنتجات
-- ===================================

-- إضافة حقول محتوى غني للمنتجات
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS long_description_ar TEXT,
ADD COLUMN IF NOT EXISTS faqs JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS key_features JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS why_choose JSONB DEFAULT '[]'::jsonb;

-- Trigger لتحديث updated_at للمراجعات
CREATE OR REPLACE FUNCTION public.update_review_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER update_reviews_updated_at
BEFORE UPDATE ON public.reviews
FOR EACH ROW
EXECUTE FUNCTION public.update_review_updated_at();

-- Function لحساب متوسط التقييم للمنتج
CREATE OR REPLACE FUNCTION public.get_product_rating(product_uuid UUID)
RETURNS TABLE(
  average_rating NUMERIC,
  review_count INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ROUND(AVG(rating)::numeric, 1) as average_rating,
    COUNT(*)::integer as review_count
  FROM public.reviews
  WHERE product_id = product_uuid
    AND is_approved = true;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public;