-- Add country_code column to orders table
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS country_code text NOT NULL DEFAULT 'SA';