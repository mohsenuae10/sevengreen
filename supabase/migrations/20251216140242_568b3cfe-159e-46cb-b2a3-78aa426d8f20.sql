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