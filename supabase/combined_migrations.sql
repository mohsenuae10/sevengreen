-- ============================================================================
-- Combined migrations for lamsetbeauty / sevengreen
-- Generated: Fri Apr 10 16:18:50 AST 2026
-- Run this in Supabase SQL Editor of the NEW project (kvieobbwmlbddqpbdovg)
-- ============================================================================


-- ============================================================================
-- 20251015155150_208257ff-a7e1-44ea-ae6a-8c9c2e5cbee3.sql
-- ============================================================================
-- إنشاء enum للصلاحيات
CREATE TYPE public.app_role AS ENUM ('admin');

-- إنشاء enum لحالات الطلب
CREATE TYPE public.order_status AS ENUM ('pending', 'processing', 'shipped', 'delivered', 'cancelled');

-- إنشاء enum لحالة الدفع
CREATE TYPE public.payment_status AS ENUM ('pending', 'completed', 'failed');

-- جدول المنتجات
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_ar TEXT NOT NULL,
  description_ar TEXT,
  price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
  image_url TEXT,
  stock_quantity INTEGER NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
  category TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  seo_title TEXT,
  seo_description TEXT,
  seo_keywords TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- جدول الطلبات
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT UNIQUE NOT NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  shipping_address TEXT NOT NULL,
  city TEXT NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL CHECK (total_amount >= 0),
  shipping_fee DECIMAL(10,2) NOT NULL DEFAULT 0 CHECK (shipping_fee >= 0),
  status order_status DEFAULT 'pending',
  tracking_number TEXT,
  payment_status payment_status DEFAULT 'pending',
  stripe_payment_id TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- جدول تفاصيل الطلبات
CREATE TABLE public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  product_name TEXT NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price DECIMAL(10,2) NOT NULL CHECK (unit_price >= 0),
  total_price DECIMAL(10,2) NOT NULL CHECK (total_price >= 0)
);

-- جدول الأدوار
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  UNIQUE(user_id, role)
);

-- جدول الإعدادات العامة
CREATE TABLE public.site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_name TEXT DEFAULT 'Seven Green | سفن جرين',
  store_logo_url TEXT,
  store_email TEXT,
  store_phone TEXT,
  default_shipping_fee DECIMAL(10,2) DEFAULT 0 CHECK (default_shipping_fee >= 0),
  currency TEXT DEFAULT 'ريال',
  facebook_url TEXT,
  instagram_url TEXT,
  whatsapp_number TEXT,
  seo_home_title TEXT,
  seo_home_description TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- إدراج سجل افتراضي للإعدادات
INSERT INTO public.site_settings (store_name, seo_home_title, seo_home_description) 
VALUES (
  'Seven Green | سفن جرين',
  'Seven Green - منتجات العناية الطبيعية',
  'متجر Seven Green لبيع الصوابين الطبيعية والشامبو العشبي ومنتجات العناية الشخصية والتجميل'
);

-- دالة لتحديث updated_at تلقائياً
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- إضافة triggers للتحديث التلقائي
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_site_settings_updated_at
  BEFORE UPDATE ON public.site_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- دالة للتحقق من الصلاحيات (security definer لتجنب recursion في RLS)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- تفعيل RLS على الجداول
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies للمنتجات
CREATE POLICY "المنتجات متاحة للقراءة للجميع"
  ON public.products FOR SELECT
  USING (true);

CREATE POLICY "المسؤولون فقط يمكنهم إضافة المنتجات"
  ON public.products FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "المسؤولون فقط يمكنهم تعديل المنتجات"
  ON public.products FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "المسؤولون فقط يمكنهم حذف المنتجات"
  ON public.products FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies للطلبات
CREATE POLICY "يمكن للجميع إنشاء طلبات"
  ON public.orders FOR INSERT
  WITH CHECK (true);

CREATE POLICY "المسؤولون فقط يمكنهم قراءة الطلبات"
  ON public.orders FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "المسؤولون فقط يمكنهم تعديل الطلبات"
  ON public.orders FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies لتفاصيل الطلبات
CREATE POLICY "يمكن للجميع إضافة تفاصيل الطلبات"
  ON public.order_items FOR INSERT
  WITH CHECK (true);

CREATE POLICY "المسؤولون فقط يمكنهم قراءة تفاصيل الطلبات"
  ON public.order_items FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies للأدوار
CREATE POLICY "المسؤولون فقط يمكنهم قراءة الأدوار"
  ON public.user_roles FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "المسؤولون فقط يمكنهم إضافة أدوار"
  ON public.user_roles FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "المسؤولون فقط يمكنهم حذف أدوار"
  ON public.user_roles FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies للإعدادات
CREATE POLICY "الإعدادات متاحة للقراءة للجميع"
  ON public.site_settings FOR SELECT
  USING (true);

CREATE POLICY "المسؤولون فقط يمكنهم تعديل الإعدادات"
  ON public.site_settings FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

-- إنشاء فهارس لتحسين الأداء
CREATE INDEX idx_products_category ON public.products(category);
CREATE INDEX idx_products_is_active ON public.products(is_active);
CREATE INDEX idx_orders_status ON public.orders(status);
CREATE INDEX idx_orders_payment_status ON public.orders(payment_status);
CREATE INDEX idx_orders_created_at ON public.orders(created_at DESC);
CREATE INDEX idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX idx_user_roles_user_id ON public.user_roles(user_id);

-- ============================================================================
-- 20251015160550_4d151d71-e9b7-4335-b88c-a278b7883a08.sql
-- ============================================================================
-- Create storage buckets for images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('product-images', 'product-images', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg']),
  ('store-assets', 'store-assets', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg', 'image/svg+xml'])
ON CONFLICT (id) DO NOTHING;

-- RLS policies for product-images bucket
CREATE POLICY "Admins can upload product images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'product-images' 
  AND (storage.foldername(name))[1] = 'products'
  AND has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Admins can update product images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'product-images'
  AND has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Admins can delete product images"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'product-images'
  AND has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Anyone can view product images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'product-images');

-- RLS policies for store-assets bucket
CREATE POLICY "Admins can upload store assets"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'store-assets'
  AND has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Admins can update store assets"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'store-assets'
  AND has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Admins can delete store assets"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'store-assets'
  AND has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Anyone can view store assets"
ON storage.objects
FOR SELECT
USING (bucket_id = 'store-assets');

-- ============================================================================
-- 20251015161500_c1bbbdd1-4b98-438c-9f27-aac726a65926.sql
-- ============================================================================
-- Insert first admin user
-- Note: You need to create a user account first through the authentication system
-- Then run this query with the actual user_id from auth.users table
-- This is a template that needs to be executed after user creation

-- Example: To add admin role to a user, replace 'USER_ID_HERE' with actual UUID
-- INSERT INTO public.user_roles (user_id, role)
-- VALUES ('USER_ID_HERE', 'admin');

-- Function to easily add admin role to a user by email
CREATE OR REPLACE FUNCTION public.add_admin_role_by_email(user_email TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target_user_id UUID;
BEGIN
  -- Get user ID from email
  SELECT id INTO target_user_id
  FROM auth.users
  WHERE email = user_email;
  
  IF target_user_id IS NULL THEN
    RAISE EXCEPTION 'User with email % not found', user_email;
  END IF;
  
  -- Insert admin role (ignore if already exists)
  INSERT INTO public.user_roles (user_id, role)
  VALUES (target_user_id, 'admin')
  ON CONFLICT (user_id, role) DO NOTHING;
  
  RAISE NOTICE 'Admin role added to user %', user_email;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.add_admin_role_by_email(TEXT) TO authenticated;

COMMENT ON FUNCTION public.add_admin_role_by_email IS 'Helper function to add admin role to a user by their email address';


-- ============================================================================
-- 20251015171552_e9c21bee-9656-4f36-beeb-12b0463a73a5.sql
-- ============================================================================
-- إضافة عمودي النطاق في جدول site_settings
ALTER TABLE site_settings
ADD COLUMN store_domain TEXT DEFAULT 'sevengreenstore.com',
ADD COLUMN store_url TEXT DEFAULT 'https://sevengreenstore.com';

-- تحديث السجل الموجود بمعلومات النطاق
UPDATE site_settings
SET store_domain = 'sevengreenstore.com',
    store_url = 'https://sevengreenstore.com'
WHERE id = '38be80b4-2e75-4c6d-b8b8-76fa2d1e4348';

-- ============================================================================
-- 20251016113528_6416c91a-8e6b-4fcf-b646-46908e8d959d.sql
-- ============================================================================
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

-- ============================================================================
-- 20251016131456_e3fc5860-de26-486e-8345-282603bc6e5c.sql
-- ============================================================================
-- حذف السياسة الحالية الخاطئة
DROP POLICY IF EXISTS "Admins can upload product images" ON storage.objects;

-- إنشاء سياسة جديدة صحيحة تسمح للـ admins برفع الصور
CREATE POLICY "Admins can upload product images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'product-images'
  AND has_role(auth.uid(), 'admin'::app_role)
);

-- ============================================================================
-- 20251016180520_82e03489-7e72-4a9d-b530-f672a2fb39c5.sql
-- ============================================================================
-- تفعيل المنتج الرابع وتصحيح فئته
UPDATE products 
SET 
  category = 'العناية بالشعر',
  is_active = true
WHERE id = '499b5dc4-37ac-4e04-a8de-e1ddff76171a';

-- إزالة المسافات الزائدة من جميع الفئات في جدول المنتجات
UPDATE products 
SET category = TRIM(category)
WHERE category LIKE '% ' OR category LIKE ' %';

-- ============================================================================
-- 20251016183256_2f2dca40-2487-4d21-9766-684d3f33c325.sql
-- ============================================================================
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

-- ============================================================================
-- 20251016184510_3c90a120-d1d4-47b3-ae34-3b656907e477.sql
-- ============================================================================
-- إضافة حقول جديدة لتفاصيل المنتج
ALTER TABLE products
ADD COLUMN IF NOT EXISTS ingredients_ar TEXT,
ADD COLUMN IF NOT EXISTS how_to_use_ar TEXT,
ADD COLUMN IF NOT EXISTS benefits_ar TEXT,
ADD COLUMN IF NOT EXISTS warnings_ar TEXT,
ADD COLUMN IF NOT EXISTS size_info TEXT,
ADD COLUMN IF NOT EXISTS made_in TEXT;

COMMENT ON COLUMN products.ingredients_ar IS 'المكونات بالعربية';
COMMENT ON COLUMN products.how_to_use_ar IS 'طريقة الاستخدام بالعربية';
COMMENT ON COLUMN products.benefits_ar IS 'الفوائد بالعربية';
COMMENT ON COLUMN products.warnings_ar IS 'التحذيرات بالعربية';
COMMENT ON COLUMN products.size_info IS 'معلومات الحجم';
COMMENT ON COLUMN products.made_in IS 'بلد المنشأ';

-- ============================================================================
-- 20251017164832_7ff17254-1927-4937-9499-22ac0503ffbf.sql
-- ============================================================================
-- Add country_code column to orders table
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS country_code text NOT NULL DEFAULT 'SA';

-- ============================================================================
-- 20251018125730_b97d1793-23cd-45ef-8b7a-759a47fa6448.sql
-- ============================================================================
-- إضافة عمود slug إلى جدول products
ALTER TABLE products 
ADD COLUMN slug TEXT;

-- إنشاء فهرس فريد للـ slug
CREATE UNIQUE INDEX products_slug_idx ON products(slug) 
WHERE slug IS NOT NULL;

-- دالة لتوليد slug تلقائياً من اسم المنتج
CREATE OR REPLACE FUNCTION generate_slug(text_input TEXT) 
RETURNS TEXT AS $$
DECLARE
  slug TEXT;
BEGIN
  -- تحويل إلى أحرف صغيرة وإزالة المسافات الزائدة
  slug := LOWER(TRIM(text_input));
  
  -- استبدال المسافات بـ -
  slug := REPLACE(slug, ' ', '-');
  
  -- إزالة الأحرف الخاصة (الإبقاء على العربية والإنجليزية والأرقام والشرطات)
  slug := REGEXP_REPLACE(slug, '[^a-z0-9\u0621-\u064A\-]', '', 'g');
  
  -- إزالة الشرطات المتعددة
  slug := REGEXP_REPLACE(slug, '-+', '-', 'g');
  
  -- إزالة الشرطات من البداية والنهاية
  slug := TRIM(BOTH '-' FROM slug);
  
  RETURN slug;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Trigger لتوليد slug تلقائياً عند الإضافة/التعديل
CREATE OR REPLACE FUNCTION auto_generate_slug()
RETURNS TRIGGER AS $$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER := 1;
BEGIN
  -- إذا كان الـ slug فارغاً، نولده من الاسم
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    base_slug := generate_slug(NEW.name_ar);
    final_slug := base_slug;
    
    -- التحقق من التكرار وإضافة رقم إذا لزم الأمر
    WHILE EXISTS (
      SELECT 1 FROM products 
      WHERE slug = final_slug 
      AND id != NEW.id
    ) LOOP
      final_slug := base_slug || '-' || counter;
      counter := counter + 1;
    END LOOP;
    
    NEW.slug := final_slug;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- إنشاء Trigger
DROP TRIGGER IF EXISTS products_auto_slug ON products;
CREATE TRIGGER products_auto_slug
  BEFORE INSERT OR UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION auto_generate_slug();

-- توليد slug للمنتجات الحالية
UPDATE products 
SET slug = generate_slug(name_ar) 
WHERE slug IS NULL;

-- تحديث الـ slugs المكررة
DO $$
DECLARE
  product_record RECORD;
  new_slug TEXT;
  counter INTEGER;
BEGIN
  FOR product_record IN 
    SELECT id, name_ar, slug
    FROM products
    WHERE slug IN (
      SELECT slug 
      FROM products 
      GROUP BY slug 
      HAVING COUNT(*) > 1
    )
    ORDER BY created_at
  LOOP
    counter := 1;
    new_slug := generate_slug(product_record.name_ar) || '-' || counter;
    
    WHILE EXISTS (
      SELECT 1 FROM products 
      WHERE slug = new_slug 
      AND id != product_record.id
    ) LOOP
      counter := counter + 1;
      new_slug := generate_slug(product_record.name_ar) || '-' || counter;
    END LOOP;
    
    UPDATE products 
    SET slug = new_slug 
    WHERE id = product_record.id;
  END LOOP;
END $$;

-- ============================================================================
-- 20251018135536_2180e25a-fc35-465b-8ccd-f5e5985b29f7.sql
-- ============================================================================
-- Add promo_messages column to public_settings table
ALTER TABLE public.public_settings 
ADD COLUMN IF NOT EXISTS promo_messages jsonb DEFAULT '[
  {"text": "عرض خاص: خصم 20% على جميع المنتجات", "icon": "tag"},
  {"text": "شحن مجاني لجميع الطلبات داخل المملكة", "icon": "truck"},
  {"text": "منتجات طبيعية 100% آمنة للبشرة", "icon": "leaf"},
  {"text": "دعم فني متاح عبر واتساب", "icon": "headphones"}
]'::jsonb;

-- Update existing row if exists
UPDATE public.public_settings
SET promo_messages = '[
  {"text": "عرض خاص: خصم 20% على جميع المنتجات", "icon": "tag"},
  {"text": "شحن مجاني لجميع الطلبات داخل المملكة", "icon": "truck"},
  {"text": "منتجات طبيعية 100% آمنة للبشرة", "icon": "leaf"},
  {"text": "دعم فني متاح عبر واتساب", "icon": "headphones"}
]'::jsonb
WHERE promo_messages IS NULL;

-- ============================================================================
-- 20251018155602_f7bb436e-65c6-4783-860b-cf576e71fa9e.sql
-- ============================================================================
-- إضافة حالة جديدة "packed" إلى order_status
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'order_status') THEN
    RAISE EXCEPTION 'order_status type does not exist';
  END IF;
  
  -- Check if 'packed' already exists
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum 
    WHERE enumlabel = 'packed' 
    AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'order_status')
  ) THEN
    ALTER TYPE order_status ADD VALUE 'packed';
  END IF;
END $$;

-- إضافة حقول جديدة لجدول orders
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS status_history jsonb DEFAULT '[]',
ADD COLUMN IF NOT EXISTS packed_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS shipped_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS delivered_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS shipping_company text,
ADD COLUMN IF NOT EXISTS estimated_delivery_date date;

-- إنشاء دالة لتحديث التواريخ تلقائياً عند تغيير الحالة
CREATE OR REPLACE FUNCTION update_order_timestamps()
RETURNS TRIGGER AS $$
BEGIN
  -- إضافة السجل إلى status_history
  NEW.status_history = COALESCE(NEW.status_history, '[]'::jsonb) || 
    jsonb_build_object(
      'timestamp', now(),
      'from_status', OLD.status,
      'to_status', NEW.status,
      'changed_by', auth.uid()
    );

  -- تحديث التواريخ حسب الحالة
  IF NEW.status = 'packed' AND (OLD.status IS NULL OR OLD.status != 'packed') THEN
    NEW.packed_at = now();
  ELSIF NEW.status = 'shipped' AND (OLD.status IS NULL OR OLD.status != 'shipped') THEN
    NEW.shipped_at = now();
    NEW.estimated_delivery_date = (now() + interval '5 days')::date;
  ELSIF NEW.status = 'delivered' AND (OLD.status IS NULL OR OLD.status != 'delivered') THEN
    NEW.delivered_at = now();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- إنشاء trigger لتحديث التواريخ
DROP TRIGGER IF EXISTS order_status_timestamp ON orders;
CREATE TRIGGER order_status_timestamp
  BEFORE UPDATE ON orders
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION update_order_timestamps();

-- ============================================================================
-- 20251018155615_428383ef-d3d9-424c-bd58-d7d0b6351eb0.sql
-- ============================================================================
-- إصلاح مشاكل الأمان: تحديد search_path للدوال

-- تحديث دالة update_order_timestamps
CREATE OR REPLACE FUNCTION update_order_timestamps()
RETURNS TRIGGER AS $$
BEGIN
  -- إضافة السجل إلى status_history
  NEW.status_history = COALESCE(NEW.status_history, '[]'::jsonb) || 
    jsonb_build_object(
      'timestamp', now(),
      'from_status', OLD.status,
      'to_status', NEW.status,
      'changed_by', auth.uid()
    );

  -- تحديث التواريخ حسب الحالة
  IF NEW.status = 'packed' AND (OLD.status IS NULL OR OLD.status != 'packed') THEN
    NEW.packed_at = now();
  ELSIF NEW.status = 'shipped' AND (OLD.status IS NULL OR OLD.status != 'shipped') THEN
    NEW.shipped_at = now();
    NEW.estimated_delivery_date = (now() + interval '5 days')::date;
  ELSIF NEW.status = 'delivered' AND (OLD.status IS NULL OR OLD.status != 'delivered') THEN
    NEW.delivered_at = now();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ============================================================================
-- 20251018165433_9a0b18aa-4511-405b-9dde-76b00f42f942.sql
-- ============================================================================
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

-- ============================================================================
-- 20251018174643_b5db1b83-0ce3-459a-b03a-3d56e536cc9e.sql
-- ============================================================================
-- Fix the slug for accessories category to use English format
UPDATE categories 
SET slug = 'accessories' 
WHERE name_ar LIKE '%اكسسوار%';

-- Update existing products to use the new slug
UPDATE products 
SET category = 'accessories' 
WHERE category LIKE '%اكسسوار%' OR category = 'الاكسسوارات-';

-- ============================================================================
-- 20251018174800_c1cd302a-7233-4388-b897-ea762162a7c8.sql
-- ============================================================================
-- Update all products to use the correct slug instead of Arabic category names
UPDATE products SET category = 'hair-care' WHERE category = 'العناية بالشعر';
UPDATE products SET category = 'skincare' WHERE category = 'العناية بالبشرة';
UPDATE products SET category = 'wellness' WHERE category = 'الصحة والعافية';
UPDATE products SET category = 'body-care' WHERE category = 'العناية بالجسم';
UPDATE products SET category = 'men-care' WHERE category = 'العناية بالرجال';
UPDATE products SET category = 'gifts' WHERE category = 'الهدايا والمجموعات';

-- Fix the home tools category slug
UPDATE categories SET slug = 'home-tools' WHERE name_ar LIKE '%الأدوات المنزلية%';
UPDATE products SET category = 'home-tools' WHERE category LIKE '%الأدوات المنزلية%';

-- ============================================================================
-- 20251018180523_eafbe347-4dec-4c3d-b782-585bd4102c89.sql
-- ============================================================================
-- Fix car accessories category slug to use English format
UPDATE categories 
SET slug = 'car-accessories' 
WHERE name_ar = 'اكسسوارات السيارة';

-- Update products to use the correct English slug
UPDATE products 
SET category = 'car-accessories' 
WHERE category LIKE '%اكسسوارات%السيارة%' OR category = 'اكسسوارات السيارة';

-- ============================================================================
-- 20251018180904_bd22dad5-220c-425b-b529-7459ee25a4e4.sql
-- ============================================================================
-- Create function to generate English slug from Arabic category name
CREATE OR REPLACE FUNCTION public.generate_category_slug()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $function$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER := 1;
BEGIN
  -- Only generate slug if it's empty or null
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    -- Generate slug based on common Arabic to English mappings
    base_slug := CASE 
      WHEN NEW.name_ar LIKE '%العناية بالشعر%' THEN 'hair-care'
      WHEN NEW.name_ar LIKE '%العناية بالبشرة%' OR NEW.name_ar LIKE '%بشرة%' THEN 'skincare'
      WHEN NEW.name_ar LIKE '%العناية بالجسم%' THEN 'body-care'
      WHEN NEW.name_ar LIKE '%العناية بالرجال%' OR NEW.name_ar LIKE '%رجال%' THEN 'men-care'
      WHEN NEW.name_ar LIKE '%الصحة%' OR NEW.name_ar LIKE '%العافية%' OR NEW.name_ar LIKE '%صحة%' THEN 'wellness'
      WHEN NEW.name_ar LIKE '%هدايا%' OR NEW.name_ar LIKE '%مجموعات%' THEN 'gifts'
      WHEN NEW.name_ar LIKE '%اكسسوارات%' AND NEW.name_ar LIKE '%سيارة%' THEN 'car-accessories'
      WHEN NEW.name_ar LIKE '%اكسسوارات%' THEN 'accessories'
      WHEN NEW.name_ar LIKE '%أدوات%' AND NEW.name_ar LIKE '%منزل%' THEN 'home-tools'
      -- Default: generate from Arabic text
      ELSE generate_slug(NEW.name_ar)
    END;
    
    final_slug := base_slug;
    
    -- Check for duplicates and add counter if needed
    WHILE EXISTS (
      SELECT 1 FROM categories 
      WHERE slug = final_slug 
      AND id != NEW.id
    ) LOOP
      final_slug := base_slug || '-' || counter;
      counter := counter + 1;
    END LOOP;
    
    NEW.slug := final_slug;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Create trigger for categories table
DROP TRIGGER IF EXISTS trigger_generate_category_slug ON categories;
CREATE TRIGGER trigger_generate_category_slug
  BEFORE INSERT OR UPDATE ON categories
  FOR EACH ROW
  EXECUTE FUNCTION generate_category_slug();

-- ============================================================================
-- 20251018181743_30dfd81c-b3b1-4524-945d-4d19c163b21c.sql
-- ============================================================================
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

-- ============================================================================
-- 20251018182433_239b1656-d0ad-4df6-9cf1-1ad67f0fe464.sql
-- ============================================================================
-- Update RLS policy to allow everyone (including anonymous users) to view active banners
DROP POLICY IF EXISTS "البنرات النشطة متاحة للجميع" ON public.promotional_banners;

CREATE POLICY "البنرات النشطة متاحة للجميع"
ON public.promotional_banners
FOR SELECT
USING (is_active = true);

-- ============================================================================
-- 20251018183545_8b101957-19ad-4d24-95de-74f37c26e724.sql
-- ============================================================================
-- Make product_id optional in promotional_banners table
ALTER TABLE public.promotional_banners 
ALTER COLUMN product_id DROP NOT NULL;

-- ============================================================================
-- 20251018184646_e4457f20-c260-43fa-8e4e-2d093322a214.sql
-- ============================================================================
-- Add text_overlay column to promotional_banners table
ALTER TABLE public.promotional_banners 
ADD COLUMN IF NOT EXISTS text_overlay text;

COMMENT ON COLUMN public.promotional_banners.text_overlay IS 'النص الذي سيتم إضافته على البنر';

-- ============================================================================
-- 20251019141236_727c6e37-1efc-4256-9e7a-08ab9a4b8b4f.sql
-- ============================================================================
-- تحديث المنتجات الحالية لاستخدام slug بدلاً من الاسم العربي
UPDATE products 
SET category = 'hair-care' 
WHERE category = 'العناية بالشعر';

UPDATE products 
SET category = 'skincare' 
WHERE category = 'العناية بالبشرة';

UPDATE products 
SET category = 'body-care' 
WHERE category = 'العناية بالجسم';

UPDATE products 
SET category = 'men-care' 
WHERE category = 'العناية بالرجال';

UPDATE products 
SET category = 'wellness' 
WHERE category = 'الصحة والعافية';

UPDATE products 
SET category = 'gifts' 
WHERE category = 'الهدايا والمجموعات';

-- إيقاف المنتجات في أقسام غير موجودة
UPDATE products 
SET is_active = false 
WHERE category NOT IN (
  SELECT slug FROM categories WHERE is_active = true
) AND category NOT IN ('hair-care', 'skincare', 'body-care', 'men-care', 'wellness', 'gifts');

-- ============================================================================
-- 20251113121954_87c7ca55-c4bb-4124-87da-be3fef88ab35.sql
-- ============================================================================
-- Add trigger to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_products_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_products_updated_at_trigger
    BEFORE UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_products_updated_at();

-- Create URL redirects table for old slugs
CREATE TABLE IF NOT EXISTS url_redirects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  old_slug TEXT UNIQUE NOT NULL,
  new_slug TEXT NOT NULL,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  redirect_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  last_used_at TIMESTAMPTZ
);

-- Enable RLS
ALTER TABLE url_redirects ENABLE ROW LEVEL SECURITY;

-- Policy: Everyone can read redirects
CREATE POLICY "الـ redirects متاحة للقراءة للجميع"
  ON url_redirects FOR SELECT
  USING (true);

-- Policy: Only admins can manage redirects
CREATE POLICY "المسؤولون فقط يمكنهم إدارة الـ redirects"
  ON url_redirects FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_url_redirects_old_slug ON url_redirects(old_slug);
CREATE INDEX IF NOT EXISTS idx_url_redirects_product_id ON url_redirects(product_id);

-- ============================================================================
-- 20251113122009_f3f7cc04-fa8b-4cc6-9e1f-d14becd1454b.sql
-- ============================================================================
-- Fix security: Update function with proper search_path
CREATE OR REPLACE FUNCTION update_products_updated_at()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

-- ============================================================================
-- 20251115132342_3bb8a0df-8003-4b8d-8008-1b4693f86302.sql
-- ============================================================================
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

-- ============================================================================
-- 20251115152551_8f12640a-87e9-4814-88ae-a9576c750bab.sql
-- ============================================================================
-- إضافة حقول GTIN و MPN للمنتجات لتحسين SEO
ALTER TABLE products
ADD COLUMN IF NOT EXISTS gtin VARCHAR(50),
ADD COLUMN IF NOT EXISTS mpn VARCHAR(100);

COMMENT ON COLUMN products.gtin IS 'Global Trade Item Number - رقم المنتج العالمي';
COMMENT ON COLUMN products.mpn IS 'Manufacturer Part Number - رقم القطعة من الشركة المصنعة';

-- ============================================================================
-- 20251115154117_58f9d541-b41f-4023-ab70-46298f22571f.sql
-- ============================================================================
-- إضافة عمود category_ar للمنتجات
ALTER TABLE products ADD COLUMN IF NOT EXISTS category_ar TEXT;

-- تحديث القيم الحالية بالعربية
UPDATE products SET category_ar = 'العناية بالشعر' WHERE category = 'hair-care';
UPDATE products SET category_ar = 'العناية بالبشرة' WHERE category = 'skincare';
UPDATE products SET category_ar = 'العناية بالجسم' WHERE category = 'body-care';
UPDATE products SET category_ar = 'العناية بالرجال' WHERE category = 'men-care';
UPDATE products SET category_ar = 'الصحة والعافية' WHERE category = 'wellness';
UPDATE products SET category_ar = 'الهدايا' WHERE category = 'gifts';

-- إضافة comment للتوضيح
COMMENT ON COLUMN products.category_ar IS 'Category name in Arabic for SEO and display purposes';

-- ============================================================================
-- 20251115162628_3e3af479-cc1e-4e27-8603-dfc308bdb824.sql
-- ============================================================================
-- تحسين عناوين SEO للمنتجات الموجودة (جعلها أقصر من 60 حرف)

-- تحديث العناوين الطويلة
UPDATE products
SET seo_title = CASE 
  WHEN name_ar LIKE '%سيروم باكوتشيول%' THEN 'سيروم باكوتشيول - بديل الريتينول | لمسة الجمال'
  WHEN name_ar LIKE '%يوسيرين%' THEN 'سيروم يوسيرين لتفتيح البشرة | لمسة الجمال'
  WHEN name_ar LIKE '%صبغة شعر%' THEN 'صبغة شعر نباتية دائمة | لمسة الجمال'
  WHEN name_ar LIKE '%صابون%' AND name_ar LIKE '%الصبار%' THEN 'صابون الصبار لتفتيح البشرة | لمسة الجمال'
  WHEN name_ar LIKE '%ايكوال بيري%' AND name_ar LIKE '%تنشيط%' THEN 'سيروم تجديد البشرة NAD+ | لمسة الجمال'
  ELSE 
    -- اختصار العنوان العام إذا كان طويلاً
    CASE 
      WHEN LENGTH(seo_title) > 60 THEN 
        LEFT(name_ar, 35) || ' | لمسة الجمال'
      ELSE seo_title
    END
END
WHERE is_active = true 
  AND (LENGTH(seo_title) > 60 OR seo_title IS NULL);

-- إضافة عناوين SEO للمنتجات التي ليس لها عنوان
UPDATE products
SET seo_title = LEFT(name_ar, 35) || ' | لمسة الجمال'
WHERE seo_title IS NULL OR seo_title = '';

-- تحديث وصف SEO ليكون بين 150-160 حرف
UPDATE products
SET seo_description = 
  LEFT(
    COALESCE(
      description_ar,
      name_ar || ' - منتج طبيعي 100% من لمسة الجمال. شحن مجاني في السعودية. اطلب الآن!'
    ),
    160
  )
WHERE (seo_description IS NULL OR seo_description = '' OR LENGTH(seo_description) > 160)
  AND is_active = true;

-- ============================================================================
-- 20251202132517_1545dc39-83ce-4ff9-a88d-440f5831dceb.sql
-- ============================================================================
-- Create blog_categories table
CREATE TABLE public.blog_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_ar TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description_ar TEXT,
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create blog_posts table
CREATE TABLE public.blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title_ar TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  excerpt_ar TEXT,
  content_ar TEXT NOT NULL,
  featured_image TEXT,
  meta_title TEXT,
  meta_description TEXT,
  meta_keywords TEXT,
  category_id UUID REFERENCES public.blog_categories(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  reading_time INT DEFAULT 5,
  views INT DEFAULT 0,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create blog_tags table
CREATE TABLE public.blog_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_ar TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create blog_post_tags junction table
CREATE TABLE public.blog_post_tags (
  post_id UUID REFERENCES public.blog_posts(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES public.blog_tags(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, tag_id)
);

-- Enable RLS on all tables
ALTER TABLE public.blog_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_post_tags ENABLE ROW LEVEL SECURITY;

-- RLS Policies for blog_categories
CREATE POLICY "التصنيفات متاحة للقراءة للجميع" ON public.blog_categories
  FOR SELECT USING (true);

CREATE POLICY "المسؤولون فقط يمكنهم إضافة التصنيفات" ON public.blog_categories
  FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "المسؤولون فقط يمكنهم تعديل التصنيفات" ON public.blog_categories
  FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "المسؤولون فقط يمكنهم حذف التصنيفات" ON public.blog_categories
  FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for blog_posts
CREATE POLICY "المقالات المنشورة متاحة للجميع" ON public.blog_posts
  FOR SELECT USING (status = 'published' OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "المسؤولون فقط يمكنهم إضافة المقالات" ON public.blog_posts
  FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "المسؤولون فقط يمكنهم تعديل المقالات" ON public.blog_posts
  FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "المسؤولون فقط يمكنهم حذف المقالات" ON public.blog_posts
  FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for blog_tags
CREATE POLICY "الوسوم متاحة للقراءة للجميع" ON public.blog_tags
  FOR SELECT USING (true);

CREATE POLICY "المسؤولون فقط يمكنهم إضافة الوسوم" ON public.blog_tags
  FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "المسؤولون فقط يمكنهم تعديل الوسوم" ON public.blog_tags
  FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "المسؤولون فقط يمكنهم حذف الوسوم" ON public.blog_tags
  FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for blog_post_tags
CREATE POLICY "روابط الوسوم متاحة للقراءة للجميع" ON public.blog_post_tags
  FOR SELECT USING (true);

CREATE POLICY "المسؤولون فقط يمكنهم إدارة روابط الوسوم" ON public.blog_post_tags
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Create indexes for better performance
CREATE INDEX idx_blog_posts_category ON public.blog_posts(category_id);
CREATE INDEX idx_blog_posts_status ON public.blog_posts(status);
CREATE INDEX idx_blog_posts_published_at ON public.blog_posts(published_at DESC);
CREATE INDEX idx_blog_posts_slug ON public.blog_posts(slug);
CREATE INDEX idx_blog_categories_slug ON public.blog_categories(slug);
CREATE INDEX idx_blog_tags_slug ON public.blog_tags(slug);

-- Trigger to update updated_at
CREATE TRIGGER update_blog_posts_updated_at
  BEFORE UPDATE ON public.blog_posts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_blog_categories_updated_at
  BEFORE UPDATE ON public.blog_categories
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- 20251209123358_62540f21-1081-465b-8a03-38976266fd6b.sql
-- ============================================================================
-- إنشاء دالة لتعيين category_ar تلقائياً من جدول categories
CREATE OR REPLACE FUNCTION public.auto_set_category_ar()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- إذا كان category_ar فارغاً أو null، نجلبه من جدول categories
  IF NEW.category_ar IS NULL OR NEW.category_ar = '' THEN
    SELECT name_ar INTO NEW.category_ar
    FROM categories
    WHERE slug = NEW.category;
  END IF;
  
  RETURN NEW;
END;
$$;

-- إنشاء trigger لتعيين category_ar تلقائياً عند إضافة أو تحديث منتج
DROP TRIGGER IF EXISTS trigger_auto_set_category_ar ON products;
CREATE TRIGGER trigger_auto_set_category_ar
  BEFORE INSERT OR UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION auto_set_category_ar();

-- ============================================================================
-- 20251216140242_568b3cfe-159e-46cb-b2a3-78aa426d8f20.sql
-- ============================================================================
-- Create invoices table
CREATE TABLE public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number TEXT NOT NULL UNIQUE,
  customer_name TEXT,
  customer_phone TEXT,
  order_id UUID REFERENCES public.orders(id),
  pdf_url TEXT NOT NULL,
  access_code TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(8), 'hex'),
  total_amount NUMERIC,
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

-- Admins can manage invoices
CREATE POLICY "المسؤولون فقط يمكنهم إدارة الفواتير"
ON public.invoices
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Anyone with access_code can view invoice
CREATE POLICY "يمكن للجميع مشاهدة الفاتورة بالكود"
ON public.invoices
FOR SELECT
USING (is_active = true);

-- Create invoices storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('invoices', 'invoices', true);

-- Storage policies for invoices bucket
CREATE POLICY "المسؤولون فقط يمكنهم رفع الفواتير"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'invoices' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "المسؤولون فقط يمكنهم حذف الفواتير"
ON storage.objects
FOR DELETE
USING (bucket_id = 'invoices' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "الجميع يمكنهم مشاهدة ملفات الفواتير"
ON storage.objects
FOR SELECT
USING (bucket_id = 'invoices');

-- Trigger for updated_at
CREATE TRIGGER update_invoices_updated_at
BEFORE UPDATE ON public.invoices
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- 20251216150626_af163a6e-42c5-472a-b274-a4b8a91e877f.sql
-- ============================================================================
-- Add new columns to invoices table for Amazon product details
ALTER TABLE public.invoices 
ADD COLUMN IF NOT EXISTS product_name text,
ADD COLUMN IF NOT EXISTS product_image_url text,
ADD COLUMN IF NOT EXISTS asin text,
ADD COLUMN IF NOT EXISTS quantity integer DEFAULT 1,
ADD COLUMN IF NOT EXISTS tax_amount numeric,
ADD COLUMN IF NOT EXISTS shipping_address text,
ADD COLUMN IF NOT EXISTS amazon_store_name text;

-- ============================================================================
-- 20251216154425_25e66f82-1859-4a3e-a008-d0364ede4e31.sql
-- ============================================================================
-- Add tax_number column to invoices table
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS tax_number text;

-- ============================================================================
-- 20251216165532_92f08db4-95a9-48fa-b2f5-9df8be14d53b.sql
-- ============================================================================
-- Create invoice_visits table for tracking
CREATE TABLE public.invoice_visits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
  visited_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  country_code TEXT,
  country_name TEXT,
  city TEXT,
  ip_address TEXT,
  user_agent TEXT
);

-- Add view_count to invoices for quick access
ALTER TABLE public.invoices ADD COLUMN view_count INTEGER DEFAULT 0;

-- Enable RLS
ALTER TABLE public.invoice_visits ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert visits (for tracking)
CREATE POLICY "يمكن للجميع تسجيل الزيارات" 
ON public.invoice_visits 
FOR INSERT 
WITH CHECK (true);

-- Only admins can read visits
CREATE POLICY "المسؤولون فقط يمكنهم قراءة الزيارات" 
ON public.invoice_visits 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Only admins can delete visits
CREATE POLICY "المسؤولون فقط يمكنهم حذف الزيارات" 
ON public.invoice_visits 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create index for faster queries
CREATE INDEX idx_invoice_visits_invoice_id ON public.invoice_visits(invoice_id);
CREATE INDEX idx_invoice_visits_visited_at ON public.invoice_visits(visited_at DESC);

-- ============================================================================
-- 20251216165603_c784c429-df7f-4eef-bd84-d651da6d9240.sql
-- ============================================================================
-- Create function to increment view count
CREATE OR REPLACE FUNCTION public.increment_invoice_views(invoice_uuid UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.invoices 
  SET view_count = COALESCE(view_count, 0) + 1 
  WHERE id = invoice_uuid;
END;
$$;

-- ============================================================================
-- 20260306120000_add_english_columns.sql
-- ============================================================================
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


-- ============================================================================
-- 20260331100000_add_missing_english_columns.sql
-- ============================================================================
-- Migration: Add missing English language columns to products, categories, and blog_posts tables
-- This migration is safe to re-run (uses IF NOT EXISTS)
-- All new columns are nullable to preserve existing data

-- Products table English columns
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

-- Categories table English columns
ALTER TABLE categories
  ADD COLUMN IF NOT EXISTS name_en TEXT;

-- Blog posts table English columns
ALTER TABLE blog_posts
  ADD COLUMN IF NOT EXISTS title_en TEXT,
  ADD COLUMN IF NOT EXISTS content_en TEXT,
  ADD COLUMN IF NOT EXISTS excerpt_en TEXT,
  ADD COLUMN IF NOT EXISTS seo_title_en TEXT,
  ADD COLUMN IF NOT EXISTS seo_description_en TEXT;

