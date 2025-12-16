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