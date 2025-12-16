-- Add tax_number column to invoices table
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS tax_number text;