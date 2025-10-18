-- Make product_id optional in promotional_banners table
ALTER TABLE public.promotional_banners 
ALTER COLUMN product_id DROP NOT NULL;