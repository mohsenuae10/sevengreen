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