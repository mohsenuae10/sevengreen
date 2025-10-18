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