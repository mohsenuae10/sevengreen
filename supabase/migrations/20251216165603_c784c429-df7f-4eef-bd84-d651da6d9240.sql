-- Create function to increment view count
CREATE OR REPLACE FUNCTION public.increment_invoice_views(invoice_uuid UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.invoices 
  SET view_count = COALESCE(view_count, 0) + 1 
  WHERE id = invoice_uuid;
END;
$$;