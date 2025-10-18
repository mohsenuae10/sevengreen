-- Create storage bucket for promotional banners
INSERT INTO storage.buckets (id, name, public)
VALUES ('promotional-banners', 'promotional-banners', true)
ON CONFLICT (id) DO NOTHING;

-- Create promotional_banners table
CREATE TABLE IF NOT EXISTS public.promotional_banners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  offer_description text NOT NULL,
  banner_image_url text,
  is_active boolean DEFAULT false,
  display_order integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.promotional_banners ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "البنرات النشطة متاحة للجميع"
ON public.promotional_banners
FOR SELECT
USING (is_active = true OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "المسؤولون فقط يمكنهم إضافة البنرات"
ON public.promotional_banners
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "المسؤولون فقط يمكنهم تعديل البنرات"
ON public.promotional_banners
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "المسؤولون فقط يمكنهم حذف البنرات"
ON public.promotional_banners
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Storage policies for promotional-banners bucket
CREATE POLICY "البنرات متاحة للعرض للجميع"
ON storage.objects
FOR SELECT
USING (bucket_id = 'promotional-banners');

CREATE POLICY "المسؤولون فقط يمكنهم رفع البنرات"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'promotional-banners' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "المسؤولون فقط يمكنهم تعديل البنرات"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'promotional-banners' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "المسؤولون فقط يمكنهم حذف البنرات"
ON storage.objects
FOR DELETE
USING (bucket_id = 'promotional-banners' AND has_role(auth.uid(), 'admin'::app_role));

-- Trigger for updated_at
CREATE TRIGGER update_promotional_banners_updated_at
  BEFORE UPDATE ON public.promotional_banners
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();