-- Update RLS policy to allow everyone (including anonymous users) to view active banners
DROP POLICY IF EXISTS "البنرات النشطة متاحة للجميع" ON public.promotional_banners;

CREATE POLICY "البنرات النشطة متاحة للجميع"
ON public.promotional_banners
FOR SELECT
USING (is_active = true);