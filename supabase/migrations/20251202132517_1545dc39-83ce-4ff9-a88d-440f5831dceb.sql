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