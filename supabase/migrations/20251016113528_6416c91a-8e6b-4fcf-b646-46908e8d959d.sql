-- 1. Create public_settings table for non-sensitive public data
CREATE TABLE IF NOT EXISTS public.public_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_name TEXT DEFAULT 'Seven Green | سفن جرين',
  store_url TEXT DEFAULT 'https://sevengreenstore.com',
  store_domain TEXT DEFAULT 'sevengreenstore.com',
  currency TEXT DEFAULT 'ريال',
  facebook_url TEXT,
  instagram_url TEXT,
  whatsapp_number TEXT,
  seo_home_title TEXT,
  seo_home_description TEXT,
  store_logo_url TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. Enable RLS on public_settings
ALTER TABLE public.public_settings ENABLE ROW LEVEL SECURITY;

-- 3. Allow everyone to read public_settings
CREATE POLICY "Public settings are readable by everyone"
ON public.public_settings
FOR SELECT
USING (true);

-- 4. Only admins can update public_settings
CREATE POLICY "Only admins can update public settings"
ON public.public_settings
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- 5. Migrate data from site_settings to public_settings
INSERT INTO public.public_settings (
  store_name,
  store_url,
  store_domain,
  currency,
  facebook_url,
  instagram_url,
  whatsapp_number,
  seo_home_title,
  seo_home_description,
  store_logo_url
)
SELECT 
  store_name,
  store_url,
  store_domain,
  currency,
  facebook_url,
  instagram_url,
  whatsapp_number,
  seo_home_title,
  seo_home_description,
  store_logo_url
FROM public.site_settings
LIMIT 1
ON CONFLICT DO NOTHING;

-- 6. Update site_settings RLS policy to be admin-only for reading
DROP POLICY IF EXISTS "الإعدادات متاحة للقراءة للجميع" ON public.site_settings;

CREATE POLICY "Only admins can read site settings"
ON public.site_settings
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- 7. Fix update_updated_at_column function with search_path
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- 8. Create trigger for public_settings
CREATE TRIGGER update_public_settings_updated_at
BEFORE UPDATE ON public.public_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();