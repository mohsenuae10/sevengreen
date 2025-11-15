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