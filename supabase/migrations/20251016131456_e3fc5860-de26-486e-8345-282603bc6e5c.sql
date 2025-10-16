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