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