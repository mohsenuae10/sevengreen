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