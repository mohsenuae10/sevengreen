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