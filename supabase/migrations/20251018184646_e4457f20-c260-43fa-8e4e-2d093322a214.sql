-- Add text_overlay column to promotional_banners table
ALTER TABLE public.promotional_banners 
ADD COLUMN IF NOT EXISTS text_overlay text;

COMMENT ON COLUMN public.promotional_banners.text_overlay IS 'النص الذي سيتم إضافته على البنر';